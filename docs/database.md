# Baza (Supabase): cədvəllər, funksiyalar, RLS, miqrasiyalar

> Bu fayl `CLAUDE.md`-dən çıxarılıb (ətraflı sənəd). Fayl yolları köhnələ bilər: qovluq quruluşu üçün həqiqət mənbəyi `ARCHITECTURE.md`-dir. Lazım olanda oxu.

## Baza (Supabase): admin reposunda da eyni bölmə var
- Layihə id **`roodclienblwrrlswmty`** (Frankfurt). Qeydiyyat (signup) bağlıdır: hesabları admin açır.
- **Təhlükəsizlik bazadadır, UI-da yox.** Bütün yetkilər RLS + funksiyalarla təmin olunur; frontendlər yalnız publishable açarla birbaşa Supabase-ə müraciət edir. UI-da düymə gizlətmək yalnız əksetdirmədir. Yeni yetki qaydası = yeni miqrasiya.
- **Gizli (service role) açar yalnız Edge Function `admin-accounts`-dadır** (admin reposunda `supabase/functions/admin-accounts/index.ts`). Əməliyyatlar: `list_emails`, `create`, `reset_password`, `delete`. Çağıranın admin olduğunu, rəhbərlik hesabı üçün sahib olduğunu və öz hesabına toxunmadığını yoxlayır. Deploy: Supabase MCP `deploy_edge_function` (`verify_jwt: true`). CORS `*`.

### Cədvəllər (`public`)
| Cədvəl | Əsas sütunlar | Qeyd |
|---|---|---|
| `profiles` | id (= auth.users.id), full_name, role (`admin`/`worker`), is_owner | `handle_new_user` trigger-i ilə yaranır |
| `employees` | full_name, position, specialty, is_management, is_storekeeper, **worker_type** (`master`/`assistant`/`driver`: usta, köməkçi, sürücü; admin işə qəbulda "İş növü" keçidi ilə seçir, `position` da ona görə yazılır; migrasiya 0052), start_date, phone, photo_url, user_id, is_active | usta və rəhbərlik birlikdə; `user_id` hesabı bağlayır; `is_storekeeper` = depo məsulu (yalnız admin təyin edir) |
| `companies` | name, kind (`company`/`market`), phone, contact_person, notes, logo_url, address, lat, lng | şirkət (bank, stadion, residence) və ya market şəbəkəsi |
| `stores` | company_id, code, name, address, lat, lng, phone, notes | şirkətin filialı / marketin mağazası |
| `tasks` | employee_id, task_date, store_id \| company_id \| place_text, reason, done, done_at, created_by | ustaya günün tapşırığı; yaradan admin/rəhbərlik, "görüldü" işarəsini usta özü qoyur |
| `tools`, `tool_assignments`, `material_pieces` | alət **və material**: name, inventory_code, category, notes, **quantity** (TAM hissənin sayı), **kind** (`tool`/`material`), **unit** (ədəd, metr, kq...); təhvil: tool_id, employee_id, **quantity**, **used** (materialda işlədilən), taken_at, returned_at; **parçalar** (`material_pieces`): tool_id, length, from_employee_id, created_at | bir ustada eyni alətdən/materialdan bir açıq təhvil (unikal indeks), yenisi verəndə say artır; view `tool_stock`: quantity, given_out (ustalarda), available (tam, depoda), kind, unit, pieces_count, pieces_total. **Ümumilikdə nə qədər var = quantity + pieces_total** |
| `work_logs` | employee_id, work_date, store_id \| company_id \| place_text, description, created_by | iş yeri: üçündən biri mütləqdir (check) |
| `work_files` | work_log_id, kind, path | `work` bucket-dəki fayllar |
| `contact_requests` | name, phone, email, message, handled | saytdakı "Bizə yazın"; Realtime-da |
| `site_settings` | tək sətir (id = 1): phone, address, hours, email, logo_url, hero_image_url, about_title, about_text, about_points, about_card_title, about_card_text, about_card_color, about_image_main_url, about_image_side_url | saytın əlaqə və ana səhifə məlumatları |
| `site_texts` | key, value | saytın sabit mətnləri (126 açar) |
| `site_segments` | slug, title, summary, lead, issues[], work[], note, equipment[] (site_equipment.key), image_url, image_position, sort, is_active | obyekt növləri → `/xidmetler/[slug]` |
| `site_equipment` | key, title, text, place, image_url, sort, is_active | avadanlıq növləri |
| `site_services` | slug, title, text, icon, lead, details, includes[], steps[], note, image_url, sort, is_active | xidmətlər siyahısı + hər xidmətin səhifəsi `/xidmet/[slug]` |
| `ac_models`, `ac_error_codes` | model; model_id, code, title, solution | Xəta kodları (`/xeta-kodlari`); `ac_brands` və `model_series` istifadə olunmur |

### Funksiyalar və trigger-lər (hamısı `security definer`)
- `is_admin()`, `is_owner()` (sahib = müdir), `my_employee_id()`: RLS qaydalarının əsası.
- `public_employees()`: açıq sayt üçün ustaların yalnız adı, ixtisası, işə başlama tarixi və şəkli (telefon yox).
- `public_management()`: açıq sayt üçün rəhbərliyin yalnız adı, vəzifəsi (`job_title`) və şəkli; müdir birinci.
- `set_employee_photo(p_employee_id, p_url)`: profil şəklinin **yeganə** dəyişmə yolu; yalnız özü və ya müdir; link həmin əməkdaşın `avatars/<id>/` qovluğuna aid olmalıdır.
- Trigger `employees_guard_photo` (BEFORE UPDATE): başqasının `photo_url`-unu birbaşa dəyişməyi bloklayır.
- Trigger `employees_sync_role` (AFTER INSERT/UPDATE): hesab rəhbərliyə (`is_management`) bağlananda `admin`, ustaya bağlananda `worker` rolu verir. Rol yalnız belə dəyişir.
- Material təhvili: RPC `finish_material(p_assignment_id, p_used)` — usta götürdüyündən `p_used` qədər işlədib: **işlənən sərf olunur** (`tools.quantity` azalır, `tool_assignments.used` yazılır), **qalan hissə depoya AYRI PARÇA kimi yazılır** (`material_pieces`; 3 usta 2 metr qaytarsa, 6 metrlik tam boru yox, 3 ədəd 2 metrlik parça); `p_used = 0` olsa götürülən olduğu kimi tam depoya qayıdır (quantity dəyişmir). RPC `give_piece(p_piece_id, p_employee_id, p_amount default null)`: parçanın hamısı və ya **bir hissəsi** ustaya verilir (`p_amount` verilsə qalan hissə depoda parça kimi qalır: 4 metrlik parçadan 2 metr verilir, 2 metrlik parça qalır); verilən hissə tam hissəyə qatılıb ustaya verilir. İkisi də `security invoker`, yetki RLS-dən (`can_manage_tools()`). Əməliyyatlar tam tam ədədlərlədir (kəsr yoxdur).
- Depo: `is_storekeeper()`, `can_manage_tools()` (= istənilən admin və ya aktiv depo məsulu, 0084; depo funksiyaları 0084-dən security definer, `finish_material` silinib); RPC `give_tool(p_tool_id, p_employee_id, p_quantity)` və `return_tool(p_assignment_id, p_quantity)` (hissə-hissə qaytarma; qaytarılan hissə bağlı sətir kimi tarixçədə qalır; ikisi də `security invoker`, yetki RLS-dən). Trigger-lər: `tool_assignments_check_stock` (depodakından çox vermək olmur, alət sətri kilidlənir), `tools_guard_stock` (say ustalardakından az ola bilməz; ustada olan alət silinmir), `employees_guard_storekeeper` (`is_storekeeper`-i yalnız admin dəyişir), `tool_assignments_only_masters` (alət yalnız aktiv ustaya, rəhbərliyə yox).
- `handle_new_user`: yeni auth istifadəçisi → `profiles` sətri. `rls_auto_enable`: yeni cədvəldə RLS-i avtomatik açır.

### Yetkilər (RLS)
- **Üç səviyyə:** sahib (müdir, `profiles.is_owner`) → admin → usta (worker). Qonaq (anon) yalnız saytın açıq məlumatlarını oxuyur.
- Giriş edən hər kəs iş cədvəllərini oxuyur (companies, stores, employees, tools, work_logs…).
- **Depo** (`tools`, `tool_assignments`, `material_pieces`): yazmaq **adminlər və depo məsulu** (`can_manage_tools()`, 0084), say yalnız təsdiqli sənədlə; usta yalnız "Aldım/Almadım", qaytarma və istək sorğusu. Depo məsulu usta da ola bilər: admin panelə daxil olub Depo bölməsini idarə edir.
- **Admin** (rəhbərlik hesabı): şirkət, mağaza, usta yazır (sayt məzmununu **yalnız müdir**, 0069); hər əməkdaşın şəkli və telefonu; müraciətləri oxuyur, dəyişir, silir. İş qeydi **açmır**.
- **Rəhbərlik (`is_management`) sətirlərini yalnız sahib yazır**; sahib öz kartını dəyişə və silə bilməz.
- **Usta**: yalnız öz iş qeydini (və fayllarını) əlavə edir; dəyişmək və silmək: sahibi və ya admin.
- **Profil şəkli**: hər kəs öz şəklini, istənilən admin (rəhbər) hamınınkını (storage də: öz qovluğu və ya admin; 0069).
- `profiles`: istifadəçi yalnız öz `full_name`-ini dəyişir; özünü və ya admin hamını görür.
- Sayt cədvəlləri (`site_*`): anon və authenticated oxuyur, admin yazır. `contact_requests`: hamı **yalnız əlavə edir**, oxumaq admin. Anon üçün oxu qaydaları ayrıdır, çünki anon `is_admin()`-i çağıra bilmir.

### Storage
| Bucket | Açıq | Limit | Yol / yetki |
|---|---|---|---|
| `work` | yox (imzalı link) | 10 MB; jpeg/png/webp/heic/pdf | `<log_id>/<uuid>.<ext>`; yükləmək usta özü, silmək sahibi/admin |
| `avatars` | bəli | 2 MB; webp/jpeg/png | `<əməkdaş_id>/<uuid>.webp`, brauzer 512px kvadrat WebP edir; öz qovluğu və ya müdir |
| `site` | bəli | 3 MB; webp/jpeg/png | `segments/`, `equipment/`, `services/`, `logo/`, `hero/`, `about/`; yalnız admin |

Storage-də `remove` faylı həmişə dərhal silmir; köhnə şəkillər bucket-də qala bilər.

### Realtime
- Publikasiya `supabase_realtime`-da: `contact_requests` (yalnız admin alır), `tasks`, `attendance`, `leave_requests`, `attendance_absences` (giriş edən hər kəs). Web-də kanal sessiya yüklənəndən sonra açılır (`supabase.realtime.setAuth`), yoxsa anon kimi qoşulur və hadisə gəlmir.

### Miqrasiyalar (`supabase/migrations/`, admin reposunda)
- `0001`–`0086`. Ad formatı `NNNN_ad.sql`; Supabase MCP `apply_migration` ilə tətbiq et və faylı da yaz.
- Mühüm olanlar:
  - 0005: work_logs, `my_employee_id`;
  - 0010: rol trigger-i;
  - 0011: avatars;
  - 0012/0013: sahib;
  - 0014/0016: contact_requests;
  - 0015: site_settings;
  - 0017: public_employees;
  - 0018: site_segments, site_services, site bucket;
  - 0020: site_equipment;
  - 0021/0022/0025: ana səhifə sahələri;
  - 0023: site_texts;
  - 0024: Realtime;
  - 0026: öz profil şəkli;
  - 0027: saytın loqosu (`logo_url`);
  - 0028: `public_management()`, saytda "Rəhbərlik";
  - 0029: xidmət səhifələri (`site_services` yeni sahələr + ilkin məzmun);
  - 0030: depo: alət sayı (`quantity`), `tool_stock`, depo məsulu (`is_storekeeper`), `give_tool`/`return_tool`; `tools.status` və `tool_current_holders` silindi;
  - 0031: alət yalnız aktiv ustaya verilir (trigger `tool_assignments_only_masters`; rəhbərlik ala bilməz);
  - 0032: depoda materiallar (mis boru, qaz balonu...): `tools.kind` (`tool`/`material`), `tools.unit`, `tool_stock`-a bu sütunlar.
  - 0033: materialın istifadəsi: `tool_assignments.used`, cədvəl `material_pieces` (depodakı qalıq parçalar), `tool_stock.pieces_count/pieces_total`, RPC `finish_material`, `give_piece`.;
  - 0034: `give_piece`-ə `p_amount`: parçanın bir hissəsini ustaya vermək (qalan hissə parça kimi qalır);
  - 0036: qablaşdırılmış material (qaz balonu...): `tools.pack_name` (balon), `tools.pack_size` (hər qabda 11), `tool_stock`-a bu sütunlar; daxildə hər şey ölçü vahidi ilə (44 kq), qab yalnız daxiletmə və göstəriş üçün ("44 kq (4 balon)");
  - 0039: `tasks` cədvəli (iş tapşırıqları), RLS və `tasks_guard` tətikçisi;
  - 0056: `tasks` Realtime-da (replica identity full);
  - 0057: tapşırıq hüquqları: admin yalnız verir və **geri alır** (`task_withdraw`, istəsə başqa ustaya; `cancelled_at/by`, `reassigned_to`), "görüldü"nü yalnız usta qoyur, silmək yoxdur;
  - 0058/0064: iş qeydinə xəta kodu (0058) istifadəçi qərarı ilə ləğv olundu, sütun silindi (0064);
  - 0059: davamiyyət: `attendance` (check_in), `leave_requests` (usta istəyir, `leave_decide` admin), Realtime;
  - 0060: `work_log_materials` (iş qeydində işlədilən material; yalnız məlumat, depoda say dəyişmir);
  - 0061: `attendance.checked_out_at`, `check_out` ("İşi bitirdim");
  - 0062: bazar günü də `check_in` (əlavə gün);
  - 0063: `leave_cancel` (usta icazədən imtina edir; başlayıbsa keçmiş günlər qalır), status `cancelled`;
  - 0086: ustanın **çoxlu istəyi**: `depot_requests.batch uuid`, `depot_request_create(..., p_batch)`; usta "Alət istə"də bir neçəsini işarələyir (hamısı eyni batch), depoda qrup kimi görünür: "Usta: N şey istəyir · X verilə bilər · Y depoda çatmır" + "Verilə bilənləri ver"; hər istəkdə "verilə bilər · depoda N" / "çatmır", çatmayanda "Qəbul" bağlıdır (✎ ilə az ver və ya rədd et), "Hamısını qəbul et" çatmayanları atlayır;
  - 0085: **kəsr miqdar** (istifadəçi: "qazı kq, ədəd və ya balon kimi seçim; 1 balon = 11,3 kq; 1 balon götürüb 3 kq işlədib qalanını qaytarsın"): depo say sütunları `numeric(12,2)` (tools, tool_assignments, material_pieces, depot_requests, stock_movements, work_log_materials), `tool_stock` yenidən yaradılıb, RPC-lər `numeric` qəbul edir; **alət yalnız tam ədəd** (tətikçi `depot_whole_tool_qty`). Qablı materialda (`pack_name` + `pack_size`) qaytarılanın tam balonları depoya, qalığı **açıq balon** (parça) kimi qayıdır (`settle_material`). UI: material formasında "Necə sayılır" (Ədəd / Kq / Metr / Litr / Balon + "1 balonda neçə kq"), göstəriş vergüllə (`fmt`, `parseQty`, `pieceWord` — `depotUtils`); təhvil (admin `HolderRow`, usta `MyTools` ReturnModal): "Qaytarır X kq/balon" + "Qalanı: işlədib | ustada qalır". Pəncərələr sadələşdirilib (istifadəçi: "gərəksiz şey istəmirəm"): Mədaxil = növ + siyahıdan seç / yeni ad + miqdar + qeyd 📎 ("Haradan gəlib" sahəsi yoxdur); alət pəncərəsi = 3 göstərici (Depoda / Ustalarda / Təmirdə və ya Açıq balonlar), sənəd düymələri, Ver, Kimdədir.
  - 0084: depo nəzarəti (sənədlər `depot_requests`, jurnal `stock_movements`, təmir `tool_repairs`, ustanın təsdiqi, bucket `depot`; ətraflı admin `CLAUDE.md`);
  - 0082: Yanacaq canlı (`mileage_logs` Realtime-da, `fuel_payments` replica identity full);
  - 0081: "Aldım" təsdiqi geri alınmır (`fuel_payment_confirm`);
  - 0080: `fuel_payments` (şirkətin verdiyi yanacaq pulu, status pending/received/disputed, `fuel_payment_confirm`), Realtime;
  - 0079: yanacaq növü (`employees.fuel_type` petrol/diesel, `fuel_settings.petrol_price`/`diesel_price`, `fuel_price_for`);
  - 0078: `mileage_fill_missing()` (sərf/qiymətsiz bağlanmış günləri doldurur);
  - 0077: yanacaq: `employees.fuel_per_100`, `fuel_settings`, `mileage_logs` (səhər/axşam km + şəkil, snapshot, hesablanan km/litr/məbləğ), `mileage_guard`, bucket `mileage`;
  - 0076: ustanın maşını (`has_car`, `car_plate` unikal, `car_model`; `employees_car_normalize`);
  - 0075: briqada adı istəyə görə; 0074: bir usta yalnız bir briqadada;
  - 0072: qrup üzvü əvəzlənəndə yeni usta qrupa qoşulur (`task_withdraw`);
  - 0073: `task_add_member` (admin qrupa sonradan usta əlavə edir; tək tapşırıq qrupa çevrilir);
  - 0071: qrup tapşırıqları (`tasks.group_id`) və briqadalar (`crews`, `crew_members`): biri "görüldü" basır, bütün qrup görülür, hər üzvə öz iş qeydi;
  - 0070: keçmiş günün tapşırığı bağlıdır (`baku_today()`, `tasks_guard`, `task_set_done`/`task_set_note`/`task_withdraw`); FK istinad boşalması (mağaza/şirkət silinməsi) həmişə keçir;
  - 0069: rəhbərlərin hüquqları: saytın məzmununu (site_* + site bucket) **yalnız müdir** yazır; istənilən admin hər əməkdaşın şəklini (`set_employee_photo`, avatars) və telefonunu dəyişir; rəhbərlik kartında (və müdirin öz kartında) admin yalnız telefon/şəkil dəyişir (`employees_guard_management`);
  - 0068: `tasks_guard`: iş qeydi silinəndə bağlantının boşalmasına geri alınmış tapşırıqda da icazə (əvvəl silmə bloklanırdı); iş silməsi əvvəl qeydi, sonra faylları silir və alınmasa xəta göstərir;
  - 0067: admin cavablanmış icazə sorğularını silir (gözləyən yox);
  - 0066: gündə bir neçə seans: `attendance` hər seans bir sətir (unikal yalnız açıq seans üçün), "Yenidən işə çıxdım";
  - 0065: `attendance_absences` (admin "işdə olmayıb" qeyd edir, usta həmin gün check_in edə bilmir), Realtime;
  - 0055: istifadə olunmayan mətnlər silindi (hero üzən kartları `home.hero.temp*`, `home.hero.badge`, `service.cta`, `team.management`, `team.masters`);
  - 0054: `site_texts.contact.route*` (Əlaqə xəritəsində "Marşrut qur");
  - 0053: `site_texts.contact.map_reset` ("Ünvana qayıt");
  - 0052: `employees.worker_type` (usta / köməkçi / sürücü), `public_employees()` növü qaytarır (usta → köməkçi → sürücü sırası), mətnlər `team.type.*`;
  - 0051: `site_clients` silindi (müştəri bölməsi ləğv), `site_settings.hero_form_enabled`;
  - 0050: ana səhifənin inam hissələri (`site_stats`, `site_faq`, `site_settings` sosial linklər; `site_clients` sonra 0051 ilə silindi);
  - 0046–0049: müraciət sürət limiti; material təhvili `settle_material` (işlədilib + qaytarılır, qalan ustada qalır; boruda ≤ 3 metr parça, > 3 tam; depoda qalan 1–3 metr avtomatik parça, `material_small_to_pieces`). Depo paneli (`DepotView`) bu təhvil formasını admin ilə eyni işlədir (`settleMaterial`);
  - 0045: xəta kodları üçün `ac_models` və `ac_error_codes.model_id` (0044 əvəz olundu);
  - 0041-0043: tapşırıqdan avtomatik iş qeydi (`tasks.work_log_id`, `tasks.note`, `task_set_done`, `task_set_note`);
  - 0040: Səbət (0038-dəki `trash` cədvəli, tətikçilər, `restore_trash`) ləğv olundu, silindi; 0038-dən yalnız `tools.min_stock` qalır;
  - 0038: `tools.min_stock` (minimum qalıq, `tool_stock`-a sütun) (Səbət hissəsi 0040 ilə silinib);
  - 0037: depo məsulunu istənilən admin təyin edir (əvvəl yalnız müdir): `employees_guard_storekeeper` `is_admin()` yoxlayır;
  - 0035: `material_pieces.original_length` (usta ilkin nə qədər qaytarıb; hissə veriləndə `length` azalır, ilkin qalır: sətir "1 metr · qalıb, ilkin 2 metr — Kərimov Orxan 2 metr qaytarıb" kimi oxunur).
- RLS dəyişikliyini simulyasiya olunmuş JWT ilə DO-blokunda yoxla: `set_config('request.jwt.claims', json_build_object('sub', <uuid>, 'role', 'authenticated')::text, true)`, `set local role authenticated`. Nəticəni `raise exception 'NƏTİCƏ ...'` ilə çıxar, bu da hər şeyi geri qaytarır.
- **Baza tipləri (2026-10-28)**: mənbə kökdə `supabase/database.types.ts` (Supabase MCP `generate_typescript_types` nəticəsi bura yazılır), sonra kökdə `node scripts/split-db-types.mjs` → admin və web `src/types/database/` (cədvəl/funksiya başına fayl, ≤ 100 sətir; əl ilə dəyişmə). Import: `import type { Tables, Database } from "@/types/database"`.

### Hesablar və məlumat
- **2026-10-24: iş məlumatı sıfırlandı** (istifadəçi: "sistemi təhvil veriləcək dərəcədə boş saxla"): tapşırıqlar, davamiyyət, icazələr, görülən işlər (+ fayl qeydləri, işlədilən material), yanacaq yürüşləri və ödənişləri, briqadalar, depoda bütün alət/materiallar və hərəkətlər (təhvil, sənəd, jurnal, təmir, parça) `truncate ... restart identity` ilə silindi. Qalır: əməkdaşlar (9) və hesablar, şirkətlər (7), mağazalar (410), sayt məzmunu, xəta kodları, maşın və yanacaq qiymətləri (istifadəçi saxlamağı seçdi), 1 sınaq müraciəti. Storage-də yetim fayllar qalıb (`work` 2, `mileage` 2): SQL ilə silinmir, Supabase → Storage-dən əl ilə.
- Sahib (müdir) = **Məmmədov Anar** (`xeyyamelizade5@gmail.com`), admin, employee id 8.
- Usta hesabı: `xeyyamalizade5@gmail.com` → **Əlizadə Xəyyam**, employee id 1. Diqqət: "e"/"a" fərqi.
- Rəhbərlik: id 7 Abdulov Ceyhun, id 8 Məmmədov Anar, id 9 Mirmanafov Mirsadiq.
- Marketlər: "Araz Market" (id 4, 200 mağaza, kodlar `ARZ-001…`), "TEST Oba Market" (id 6, 200 mağaza, `OBA-001…`). Mağazalar `excel/*-market-200.xlsx`-dən import olunub, məlumat uydurmadır. İstifadəçi "TEST" sözünü adlardan hələlik götürməmək dedi.
- Şirkətlər: Rabitə Bank (id 7, 10 filial), Qarabağ Stadion, Knightsbridge Residence, Port Baku Residence, İzmir Villa (filialsız, sabit məkan).
- 2026-10-18: iş qeydləri, tapşırıqlar və fayl qeydləri istifadəçi istəyi ilə **hamısı silindi** (baza təmizdir); `work` bucket-ində `32/` qovluğunda 2 yetim şəkil qalıb (SQL ilə silinmir, Storage panelindən əl ilə). Xəta kodları: bütün köhnə kodlar silinib; bazada Daikin SM-TS3 cədvəlindən 334 kod var (3 model, Azərbaycan dilində; ətraflı admin `CLAUDE.md`). Müraciətlər: istifadəçinin yazdığı sınaq müraciətlər var.
