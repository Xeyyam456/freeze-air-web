@AGENTS.md

# CLAUDE.md — Freeze Air Service: Sayt və usta paneli (Next.js)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ünsiyyət
- Hər şey Azərbaycan dilində: cavablar, izahlar, kod şərhləri. Kod, identifikatorlar, texniki terminlər olduğu kimi.
- Qısa, birbaşa. İstifadəçi ilə məcburi razılaşma yoxdur: səhvi açıq de, səbəbini qısa izah et, daha yaxşı variant təklif et.
- İstifadəçi "etmə, hələlik cavab ver" deyəndə yalnız cavab ver, kod yazma.

## Sistem haqqında (iki repo, bir baza)
Kondisioner servis şirkəti **Freeze Air Service** üçün sistem: ustalar, müqavilə bağlanan şirkətlər (filialları) və marketlər (mağazaları), alətlər (depo), ustaların gündəlik iş qeydləri, rəhbərlik, açıq sayt.

| Repo | Nədir | Kim üçün | Port |
|---|---|---|---|
| **web** (bu repo) | Next.js 16 | açıq sayt (qonaq) + usta paneli (baxış, yalnız öz işləri) | 3000 |
| **admin** (ayrı repo) | Vite 8 + React 19 SPA | adminlər və rəhbərlik: hər şeyi idarə edir, saytın məzmununu da | 5173 |

İkisi də **eyni Supabase layihəsini** işlədir. Admin funksiyaları bu repoda **yoxdur**. `supabase/` qovluğu (miqrasiyalar + Edge Function) **admin reposuna aiddir**; baza dəyişikliyi lazım olanda miqrasiya orada yazılır, Supabase MCP ilə tətbiq olunur.

## Layihə strukturu, git və iş qaydaları (admin və web fayllarında eynidir)
- **Qovluqlar** (`D:\Praqramlasirma\Projects\kondisioner-servis\`): `admin/` (Vite, 5173), `web/` (Next.js, 3000), `supabase/` (miqrasiyalar `0001`–`0054`, hamısı bazada tətbiq olunub + Edge Function `admin-accounts`; repolar ayrılanda `admin/supabase/`-a köçürüləcək), `excel/` (test və import faylları, heç bir repoya aid deyil, git-ignore). **Kökdə CLAUDE.md yoxdur**: hər platformanın öz faylı tamdır, işlədiyin platformanın qovluğundan başla (`admin/CLAUDE.md` və ya `web/CLAUDE.md`).
- **Yeni kompüterdə qurmaq**: `git clone https://github.com/Xeyyam456/kondisioner-servis.git`; `admin/` və `web/`-də `npm install`; hər qovluqda `.env.example`-ı `.env.local` adı ilə kopyala və publishable açarı doldur (Supabase → Project Settings → API); `npm run dev`. Gizli (service role) açar lokalda lazım deyil. Baza və Edge Function Supabase-dədir (kopyalanmır).
- **Git**: hələlik **bir repo** (kök, budaq `main`): `admin/`, `web/`, `supabase/` birlikdə commit və push olunur, sonda ayrılacaq (məs. `git subtree split --prefix=admin`). **Ayrı deploy repoları** (2026-10-19): `web/` → `github.com/Xeyyam456/freeze-air-web`, `admin/` → `github.com/Xeyyam456/freeze-air-admin` (ikisi private, budaq `main`, remote adları `web` və `admin`; Vercel bunlardan deploy edir). Kök repo işləmə yeri qalır, bu ikisi onun `subtree` güzgüsüdür: **ayrı repolarda birbaşa dəyişiklik etmə**. **Push qaydası (istifadəçi qərarı, 2026-10-20)**: commit və push **yalnız istifadəçi deyəndə** ("push et", "pushla"); deyəndə dəyişən hər şey **həm kökə, həm də aid ayrı repoya** push olunur: `git push origin main`, sonra dəyişən qovluğa görə `git subtree push --prefix=web web main` və/və ya `git subtree push --prefix=admin admin main` (yalnız `supabase/` dəyişibsə ayrı repo lazım deyil). Yarımçıq və ya uğursuz iş push olunmur; istifadəçi "hələ push etmə" desə gözlə. Commit mesajı Azərbaycanca. Commitdən əvvəl: admin `npx tsc -b`, web `npx tsc --noEmit` + `npx eslint src`. `.env*` və `excel/` repoya düşmür, `.gitattributes`: LF. İstifadəçi "hələ push etmə, xoşuma gəlməsə geri dönək" deyəndə yeni funksiya `feature/...` budağında commit olunur; təsdiqdən sonra `main`-ə `--ff-only` + push (bazadakı miqrasiyalar budaqla geri qayıtmır: miqrasiya faylının başına `drop` əmrlərini yaz).
- **Dev serverləri Claude özü idarə edir** (2026-10-17-dən, istifadəçi istəyi): `admin/` → `npm run dev` (5173), `web/` → `npm run dev` (3000), fon prosesləri. Chrome-da hər biri üçün ayrı tab açıq qalır (admin, landing, usta paneli), tabları bağlama. Yaddaş azalıb server ölərsə yenidən başlat və tabı yenilə.
- **Bazaya yazma (Claude Code icazələri)**: Supabase MCP `apply_migration` üçün icazə qaydası var (istifadəçi `/permissions` ilə əlavə edib; yoxdursa auto-rejim "Production Deploy" ilə bloklayır). Claude öz icazə fayllarını (`.claude/settings*.json`) dəyişə bilmir ("Self-Modification" bloku): qayda lazımdırsa istifadəçi `/permissions` ilə əlavə edir. Bloklanan miqrasiyanı dolayı yolla keçməyə çalışma: SQL-i istifadəçiyə ver, o, Supabase paneli → SQL Editor-də (`https://supabase.com/dashboard/project/roodclienblwrrlswmty/sql/new`) işlədir. Toplu silmə və `drop`-dan əvvəl hədəfə (sətir sayı, nələr silinir) bax və istifadəçinin sözünü yoxla.

## Komandalar
Test yoxdur. Yoxlama = tip yoxlaması + lint + brauzerdə canlı test.
- `npm run dev` (port 3000, fonda), `npx tsc --noEmit`, `npx eslint src`. **Dev işləyərkən `next build` işlətmə.**
- Turbopack bəzən `globals.css` dəyişikliyini götürmür → port 3000-dəki node prosesini PowerShell ilə öldür (`Get-NetTCPConnection -LocalPort 3000 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`), sonra `rm -rf .next && npm run dev`.
- Yaddaş azalanda dev serverin daxili worker-ləri ölə bilər ("Jest worker encountered … child process exceptions"): prosesi öldürüb yenidən başlat. Claude Code fondakı serveri yaddaş azalanda özü dayandıra bilər: istifadəçiyə de, istəsə başlat.
- Bazada yeni sütun əlavə olunanda `use cache` köhnə məlumatı 5 dəqiqəyə qədər qaytara bilər (məs. yeni `slug` görünməz, səhifə 404). Gözləmək və ya `rm -rf .next` + yenidən başlatmaq lazımdır. `notFound()` Suspense daxilində olanda curl 200 qaytarır, yoxlamanı brauzerdə və ya məzmunla (`grep`) et.
- Brauzer testi: Claude in Chrome, ayrı açıq saxlanan tabda (`localhost:3000/panel`); usta hesabı (Əlizadə Xəyyam) brauzerdə artıq daxil olub. Parol yazma. Dev serveri Claude özü fonda işlədir (yuxarıda "Layihə strukturu, git və iş qaydaları").
- **Next dev göstəricisi "1 Issue"** = real xəta: konsola bax (`read_console_messages`). Client komponentdə render zamanı `new Date()` oxumaq Cache Components-də xətadır → komponenti `<Suspense>` daxilində işlət (`/panel`-də `WorkHistory`) və ya tarixi effektdə oxu.

## Stack və Next 16 xüsusiyyətləri
- Next.js 16.4.1 (App Router, Turbopack, **Cache Components**), React 19, Tailwind v4, TypeScript, `@supabase/ssr`, lucide-react. Kod yazmazdan əvvəl `node_modules/next/dist/docs/`-a bax (AGENTS.md).
- Middleware yerinə `src/proxy.ts`: auth yönləndirmə; `PUBLIC_PATHS` + `/xidmetler/` və `/xidmet/` prefiksləri açıqdır, qalanı girişlə.
- Klik olunan hər şeydə əl kursoru (`globals.css` base qaydası). Yumşaq sürüşmə (Lenis) sınanıb və istifadəçinin istəyi ilə **silinib**: yenidən təklif etmə.
- cookies, params və runtime data `<Suspense>` daxilində; server `createClient()` `await connection()` çağırır.
- Açıq məlumat (sayt məzmunu) `"use cache"` + `cacheLife(SITE_CACHE)` ilə (`lib/site-cache.ts`: revalidate 5 san., stale 30, expire 60), **cookie-siz** klientlə (`createClient` from `@supabase/supabase-js`, `persistSession: false`). Admin dəyişikliyi saytda ~5 saniyəyə görünür (istifadəçi 1 dəqiqəni çox gördü); səhifəni yeniləmək lazımdır, saytdaxili keçiddə Next-in brauzer keşi 30 saniyədən az ola bilmir.
- **Landing dev nişanları (2026-10-18)**: `SITE_CACHE` qısa ömürlüdür (expire 60 san. < 5 dəq), Next 16 onu oxuyan hər şeyin `<Suspense>` daxilində olmasını tələb edir → `app/(site)/layout.tsx`-də header, səhifə (`<main>`) və footer ayrı `<Suspense>`-dədir (fallback eyni hündürlükdə). Qalan "Instant" xəbərdarlığı (hər Page üçün default yoxlama, build-i bloklamır) `next.config.ts`-də `experimental.instantInsights.validationLevel: "manual-warning"` ilə söndürülüb. `expire`-i 300-ə qaldırmaq kifayət etmədi (geri qaytarıldı). `next.config` dəyişəndə dev serveri yenidən başlat.
- Mutasiyadan sonra client komponentdə `router.refresh()`.
- React 19 `<form action>` göndərəndən sonra formanı sıfırlayır, xətada da. Ona görə `ActionForm` / `onSubmit` + `startTransition(() => action(fd))` işlənir.
- Lint qaydaları: `react-hooks/refs` (renderdə ref oxuma yox), `set-state-in-effect`; storage şəkilləri üçün `<img>` + `eslint-disable-next-line @next/next/no-img-element`.
- `.env.local` (git-ignored, **oxuma**): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Gizli açar bu layihədə işlənmir; `SUPABASE_SECRET_KEY` sətri varsa silinməlidir.

## Marşrutlar
- **Açıq sayt**: route group `app/(site)/`, öz layout-u ilə.
  - `/`: hero, Haqqımızda, obyektlər, xidmət kateqoriyaları, sürətli əlaqə + xəritə.
  - `/avadanliq`, `/xidmetler`, `/xidmetler/[slug]` (obyekt növü), `/xidmet/[slug]` (xidmət səhifəsi: mətn, "Nə daxildir", addımlar, yapışan zəng bloku, digər xidmətlər), `/nece-isleyirik`, `/ustalarimiz`, `/elaqe`.
- **Giriş**: `/login` → uğurdan sonra `/panel`; çıxış → `/`. **Müasir dizayn** (2026-10-18, istifadəçi istəyi): solda tünd navy marka hissəsi ("Usta paneli" nişanı, başlıq, 3 xüsusiyyət kartı: tapşırıqlar, işlər, alət/material), sağda kölgəli giriş kartı (ikonlu e-poçt və parol sahələri, parolu göstər/gizlət, "Sayta qayıt" keçidi); dar ekranda sol hissə gizlənir, marka kartın üstündə görünür.
- **Usta paneli** (yalnız girişlə; route group `app/(panel)/`): `/panel`, `/sirketler`, `/magazalar(/[id])`, `/ustalar`, `/tapshiriqlar`, `/statistika`, `/rehberlik`, `/xeta-kodlari`, `/depo` (yalnız depo məsulu). Ustanın "Alətlər" tabında say (×N) göstərilir.
- **Usta paneli ana səhifəsi (`/panel`) qəsdən sadədir** (istifadəçi: "o qədər şeyə gərək yoxdu"): solda **Görülən işlər** (`components/work/WorkHistory.tsx`, client): seçilmiş günün bütün ustalar üzrə işləri (kim, harada, nə iş, saat; Bakı vaxtı), standart bu gün; **"Bu gün" / "Dünən" düymələri və təqvim** (`DatePicker`, gələcək gün seçilmir) ilə tarixçəyə baxılır, başlıqda günün iş sayı; **sətrə klik → `components/work/WorkLogModal.tsx`** (admin paneldəki ilə eyni: usta, iş günü + əlavə olunma saatı, yer + xəritə, görülən iş, akt və şəkillər), sağda **Depo** kartı (`components/depot/ToolsPanel.tsx`: iki tab **Alətlər / Materiallar**; Alətlər: cəmi/ustalarda/depoda xanaları: **klik → modal**, həmin hissədəki alətlər və sayı, `components/depot/ToolStats.tsx`; altında "Kimdə nə var": hər ustada hansı alət və neçə ədəd; öz kartın birinci və "Sən" nişanı ilə). Göstərici kartları və "Bölmələr" yoxdur; sonra əlavə olunacaq (istifadəçi: "sonra əlavə ederik"). Menyu dəyişməyib.
- **`/panel` yuxarıda "Mənim bugünüm" kartı** (2026-10-17; `components/work/MyDay.tsx`): bugün neçə iş yazılıb + **"İş əlavə et"** düyməsi → `WorkLogForm`; əməkdaş kartı olmayan hesabda görünmür. İş yazılanda `window` hadisəsi `WORK_SAVED` atılır: sayğac və `WorkHistory` siyahısı yenilənir.
- **Mağaza axtarışı / "Yol tap" web-də YOXDUR** (istifadəçi qərarı: veb görünüşdə naviqatorla yola düşməyəcəklər, bu **mobil tətbiqdə** lazım olacaq; "tələsmə"). Yenidən əlavə etmə. Hazır qaralama git tarixçəsindədir: commit `019f8e4` (`components/StoreFinder.tsx`, `lib/navigation.ts` → `directionsUrl`/`wazeUrl`).
- **Xəta kodları (`/xeta-kodlari`, menyuda "Xəta kodları")**: yalnız baxış (`components/errors/ErrorCodeView.tsx`, client): **kondisioner modelini dropdown-dan seçib** kodlarına baxırsan, kod/açıqlama yazıb da axtarmaq olar; kartlarda kod, model, açıqlama, "Edilecək iş". Məzmunu admin paneldən idarə olunur (`ac_models` + `ac_error_codes`: model_id, code, title, solution).
- **Tapşırıqlar (`/tapshiriqlar`, menyuda "Tapşırıqlar")**: admin/rəhbərlik ustaya gün üçün iş verir (admin paneldə; usta + yer + səbəb). Burada hamının tapşırıqları görünür (gün seçimi ‹ ›), öz kartın birinci və "Sən" nişanlı; **yalnız öz tapşırığının qutusunu** işarələyə bilirsən (bazada `tasks_guard` başqa sahəni və başqasının tapşırığını bloklayır). `components/work/TasksView.tsx`, `<Suspense>` daxilində. `/panel`-də "Mənim bugünüm" kartında "Tapşırıq: N · görülən: M" keçidi (`MyDay.tsx`). Cədvəl `tasks` (migrasiya 0039). **✓ basanda iş avtomatik "Görülən işlər"ə düşür; görülmüş öz tapşırığında qələm ikonu → "Təmir barədə" pəncərəsi** (`TaskNoteModal.tsx`: yazı, akt, şəkillər; əvvəlkilər doldurulur, şəkillər × ilə silinir). Ətraflı: admin `CLAUDE.md`.
- **Statistika (`/statistika`, menyuda "Statistika")** (2026-10-17, istifadəçi istəyi: "ay ərzində gördüyü işlər"; "gündə orta lazım deyil, səliqəli et"): yalnız **öz** işləri (`components/work/MonthStats.tsx`, client, `<Suspense>` daxilində). Ay seçimi (‹ ay ›, "Bu ay"); **admin-dən fərqli, parlaq dizayn** (istifadəçi: "daha da fərqli ola bilər"): üstdə mavi→firuzəyi **hero kart** (iri iş sayı, əvvəlki aya görə fərq, "İş görülən gün" və "Fərqli yer" şüşə xanaları, ay oxları, **Günlük/Yığım** rejimi, "Cədvəl"), içində ağ parlayan **hamar əyri** (hover: şaquli xətt, nöqtə, tooltip); altda solda **ayın kalendarı istilik xəritəsi** (gün xanaları iş sayına görə rənglənir, bugün halqa ilə), sağda **ən çox işlənən yerlər** (top 5, qradiyent zolaq). İş sayı fərqi əvvəlki ayın 1-dən sonuna qədər tam sayına görədir (istifadəçi qərarı: "keçən ayın eyni günündən yox"). **Excel ixracı**: hero kartda ağ "Excel" düyməsi seçilmiş ayın öz işlərini rəngli .xlsx faylına yazır (`lib/export-month.ts`, `write-excel-file` 4.1.1, admin "Görülən işlər" ixracı ilə eyni üslub: tünd başlıq, xülasə, donmuş mavi cədvəl başlığı, zebra, Tarix/Saat/İş yeri/Görülən iş, "Cəmi"; ad `islerim-YYYY-AA.xlsx`; saat Bakı vaxtı ilə). Hər usta yalnız ÖZ işini çıxarır. dataviz qaydaları: bir seriya → legend yox, bir hue (`primary`), mətn rəngi seriya rəngi deyil. Əməkdaş kartı olmayan hesabda mesaj. Dark rejim yoxdur (tətbiq yalnız açıq).
- **Depo (`/depo`) yalnız depo məsulu (və müdir) üçün** (istifadəçi qərarı): menyuda bənd yalnız `can_manage_tools()` doğru olanda görünür (`AppHeader` → `PanelNav` → `NavLinks showDepot`), başqası ünvana girsə `/panel`-ə yönləndirilir. Paneldəki "Bölmələr"-də Depo yoxdur. Səhifə admin-dəki Depo ilə eynidir: **Alətlər / Materiallar tabları**, "Siyahı / Ustalar üzrə", "Yeni alət/material" (`components/depot/DepotView.tsx` ← admin `DepotForms.tsx`, depo məsulu kartı olmadan, tab vəziyyəti `DepotShell`-dədir; aksiyalar `lib/tools.ts` ← admin `actions/tools.ts`, mutasiyadan sonra `router.refresh()`). Siyahıda yalnız ustalar. Usta panelində **ustada olan materiallar da görünür** (istifadəçi istəyi): `/panel` "Kimdə nə var" (alət `Wrench`, material `Package` ikonu və "12 metr"), **Ustalar səhifəsində alət/material yoxdur** (istifadəçi: "sadəcə usta məlumatı və gördüyü işlər olsun"): usta pəncərəsində yalnız "Haqqında" və "İşlər" tabları, kartda yalnız təcrübə və "Bu gün: N iş". Alət xanaları (Cəmi/Ustalarda/Depoda və modallar) yalnız alətlər üzrədir (`kind = 'tool'`); materialın idarəsi yalnız Depo-dadır. Depo məsulunu müdir admin paneldən təyin edir. Admin-dəki kimi: **Tarixçə** pəncərəsi (`components/depot/HistoryModal.tsx`) və **minimum qalıq** (`tools.min_stock`, cədvəldə "azdır" nişanı, `isLowStock()`).
- **SEO** (2026-10-18): `app/sitemap.ts` (sabit səhifələr + bazadakı aktiv xidmət/obyekt), `app/robots.ts` (panel və giriş bağlıdır), `metadataBase` + Open Graph (`app/layout.tsx`), ana səhifədə `LocalBusinessJsonLd` (`HVACBusiness`; telefon, ünvan, e-poçt bazadan, yer tutucu "XX" olanda göndərilmir). Ünvan `lib/site-url.ts` → `NEXT_PUBLIC_SITE_URL` (**canlıda mütləq yaz**). `robots.txt` və `sitemap.xml` `proxy.ts`-də `PUBLIC_PATHS`-dadır (yoxsa `/login`-ə yönlənir).
- **Keşin dərhal təmizlənməsi**: bütün `use cache` funksiyaları `cacheTag(SITE_TAG)` daşıyır; `POST /api/revalidate` (`app/api/revalidate/route.ts`) admin JWT-ni `is_admin()` ilə yoxlayıb `revalidateTag(SITE_TAG, { expire: 0 })` çağırır. CORS yalnız `ADMIN_ORIGIN`. Yeni `use cache` funksiyasına da `cacheTag(SITE_TAG)` əlavə et.
- Yeni açıq səhifə əlavə edəndə `proxy.ts`-də `PUBLIC_PATHS`-a da əlavə et (`/xidmetler/` və `/xidmet/` prefiksləri açıqdır).
- **Landing yenilənməsi (2026-10-18, "professional səviyyə")**: ana səhifənin ardıcıllığı: hero (solda **sürətli müraciət formu** `HeroQuickForm`: ad + telefon, "Bizə yazın" ilə eyni server action, altında telefon; sağda foto) → **rəqəmlər zolağı** `StatsStrip` (hero-nun üstünə yarı çıxan ağ kart, `CountUp` sayğacı) → Haqqımızda → obyekt kartları → **Necə işləyirik** 3 addım `HowSteps` → xidmət kateqoriyaları (göy) → **FAQ** `FaqSection` (`<details name="home-faq">`, hamısı bağlı; **düzülüş hələ həll olunmayıb (2026-10-20)**: iki sütun (başlıq solda, suallar sağda), ortada dar sütun və indiki tam en (başlıq solda + "Bizə yazın" sağda, suallar altında) üçü də bəyənilmədi, istifadəçidən yeni variant soruş; Google üçün `FAQPage` JSON-LD) → sürətli əlaqə + xəritə (`hl=az`). Hamısı `components/landing/TrustSections.tsx`-dədir; məzmun admin "Sayt → Etibar və suallar"dan (cədvəllər `site_stats`, `site_faq`, migrasiya 0050; `lib/site-trust.ts`, `cacheTag(SITE_TAG)`). **Rəqəm/sual siyahısı boşdursa (rəqəmlər üçün < 2) həmin bölmə göstərilmir.** İlk rəqəmlər bazadakı real saydır (usta, xidmət növü, obyekt növü); uydurma rəqəm yazma. **"Bizə etibar edənlər" (müştəri loqoları) bölməsi istifadəçi qərarı ilə ləğv olunub (2026-10-19, migrasiya 0051: `site_clients` silindi): yenidən təklif etmə.**
- **Header (2026-10-20, "müasir")**: bir sətir, yapışan, şüşə (ağ 85% + bulanıqlıq, sürüşəndə kölgə; hündürlük 77px, hero `100svh-77px`); solda loqo, ortada menyu həb düymələrdə (aktiv ağ həb) + "Xidmət növləri", sağda telefon (ikon; 1600px-dən dar ekranda nömrə gizlənir), tünd "Usta çağır", giriş/panel ikon düymə. Əvvəlki iki qatlı (ağ loqo zolağı + göy menyu) silindi. **Footer**: sosial düymələr `FooterSocial` (WhatsApp telefondan `whatsappHref`, Instagram/Facebook `site_settings.instagram_url/facebook_url`; yalnız doldurulanlar; ikonlar `SocialIcons.tsx`, lucide-də brend ikonu yoxdur).
- **Hərəkətlər**: hero elementləri `.hero-in` (yalnız CSS, `--d` gecikmə); bölmələr `Reveal` (IntersectionObserver, `.js .reveal`), rəqəmlər `CountUp`. `<html>`-ə `js` sinfini `layout.tsx`-dəki kiçik skript qoyur; JS işləməsə hər şey görünür, 3 san. sonra `failsafe` animasiyası məcburən göstərir; `prefers-reduced-motion`-da hərəkət yoxdur. Yeni animasiyanı yalnız bu sistemlə et. **Mobil/responsivlik sonda toplu işlənəcək (istifadəçi qərarı): indi mobillə bağlı heç nə etmə.**
- **`<Suspense>` fallback qaydası (2026-10-18)**: fallback heç vaxt real məzmundan fərqli görünən şey (illüstrasiya, SVG, başqa şəkil) olmasın, yalnız neytral boş qutu/skelet (eyni ölçüdə). Hero-da fallback əvvəl SVG illüstrasiya idi: başqa səhifədən qayıdanda SVG → real şəkil yanıb-sönürdü; indi `aspect-[16/9]` yarımşəffaf qutudur (`app/(site)/page.tsx`).
- **Header menyusu**: sağda ayrıca **"Xidmət növləri"** düyməsi (`components/landing/SiteNav.tsx`, client): klik ilə açılır, aktiv xidmətlərin siyahısı (`/xidmet/<slug>`); kənara klik/Escape bağlayır; yalnız masaüstündə (mobildə `/xidmetler`). "Xidmətlər" bəndi adi keçid qalır (hover ilə açılan variant istifadəçiyə yaramadı: yenidən təklif etmə).
- Footer: xidmətlər `/xidmet/<slug>`-a aparır; telefon (`tel:`), ünvan (Google Maps), e-poçt (`mailto:`) klik olunur.
- Qərar (2026-10-17): qonaq yalnız saytı görür; məlumat bölmələri (ünvan, telefon, müqavilə) açıq deyil.

## Açıq sayt: hər şey bazadan, admin paneldən idarə olunur
- **Saytda sabit mətn yoxdur.** Bütün mətnlər (menyu, header, footer, başlıqlar, düymələr, form yazıları, brauzer tab başlığı) `site_texts`-dədir → `lib/site-texts.ts`:
  - `TEXT_DEFAULTS`: 111 açar, ehtiyat mətn;
  - `getTexts()`: `use cache`;
  - `lines()`: siyahı mətni, hər sətir bir bənd;
  - `pageTitle()`.
- Yeni mətn əlavə etmək: `TEXT_DEFAULTS`-a açar + admin reposunda `components/site/textFields.ts`-ə sahə + bazaya sətir (miqrasiya). Server komponent `const t = await getTexts()`, client komponentə `t` prop kimi ötürülür (`ContactForm`, `SiteNav`).
- `components/landing/content.ts`-də yalnız ünvanlar, ikonlar və mətn açarları var (`sitePages(t)`, `STEPS`, `DELIVERABLES`, `CATEGORIES`).
- `lib/site-settings.ts`:
  - `getContact()`: telefon, ünvan, saatlar, e-poçt;
  - `formatPhone`, `telHref`, `whatsappHref`;
  - `getLogo()`: saytın loqosu (yoxdursa qar dənəsi ikonu; footer-də ağ kartın içində);
  - `getHomeContent()`: hero şəkli, Haqqımızda (mətn, siyahı, kart, kart rəngi `night|cold|ice|white`, 2 şəkil).
- `lib/site-content.ts`:
  - `getSegments`, `getServices`, `getEquipment`, `segmentEquipment`;
  - `ILLUSTRATED_KEYS` / `isIllustrated`: şəkli olmayan avadanlıq üçün hazır SVG (`components/landing/AcIllustrations.tsx`).
- `lib/public-employees.ts`: `getPublicEmployees()` (RPC `public_employees()`: ad, ixtisas, təcrübə, şəkil) və `getPublicManagement()` (RPC `public_management()`: ad, vəzifə, şəkil); telefon yox. `/ustalarimiz` (2026-10-20): solda yapışan tünd aurora panel (usta, köməkçi, sürücü sayı — üçü də həmişə, `CountUp` ilə — + çağırış; kartın sağ yuxarı küncündə iş növü sakit haşiyəli həbdə (**şəklin üstündə nişan bəyənilmədi**: tünd və şüşə variantları); **təcrübə illərinin cəmi "41+" peşəkar sayılmadı, çıxarıldı**), sağda iki sütunlu üfüqi usta kartları (şəkil, ixtisas, ad, təcrübə + ən təcrübəliyə nisbətən dolan zolaq; `PublicEmployee.months`); **iri portret kartlar bəyənilmədi**; **"Rəhbərlik" kartları istifadəçi istəyi ilə səhifədən çıxarılıb** (`getPublicManagement` hələ istifadə olunmur, məlumat admin-də qalır).
- Komponentlər (`components/landing/`):
  - `LandingHeader` (ağ loqo zolağı + yapışan göy `SiteNav`), `SiteFooter` (4 sütun), `PageIntro` (alt səhifə banneri);
  - `SegmentCards`, `SegmentVisual` (`image_position`: top/center/bottom), `EquipmentVisual` (şəkil `object-contain`, kəsilmir), `ContactForm`, `WhatsAppIcon` (simple-icons loqosu), `icons.ts` (xidmət ikonları; `ServiceIcon name=...`: render zamanı dinamik komponent yaratmamaq üçün, lint qaydası `react-hooks/static-components`).
- Dizayn:
  - başlıq şrifti Unbounded (`font-display`, latin-ext);
  - palitra `night`, `glacier`, `ice`, `cold`, `heat`;
  - konteyner `.site-wrap` (max 1760px);
  - şəkillər kəsilmir: öz nisbətində və ya `object-contain`.
- "Bizə yazın" (`/elaqe`): `ContactForm` → server action `app/(site)/elaqe/actions.ts`.
  - Gizli tələ sahəsi `website`. Cookie-siz klient; baza yalnız əlavə etməyə icazə verir. Sürət limiti bazadadır (migrasiya 0046, tətbiq olunub): `too_many_requests` xətası istifadəçiyə "Çox sayda müraciət" kimi göstərilir.
  - Nəticə tostla bildirilir: uğurda forma təmizlənir, xətada yazılanlar qalır.
  - Admin panelində Realtime ilə dərhal görünür.

## Usta paneli
- `components/`:
  - `AppHeader` ("Usta paneli"; sağda `ProfileButton`: ad, rol, şəkil; klik → profil pəncərəsi, usta **öz** şəklini qoyur və dəyişir RPC `set_employee_photo` ilə), `LogoutButton` (təsdiq modalı);
  - `SidePanel` (`WithSidePanel`), Modal / ConfirmModal / ConfirmButton, DatePicker, MapButton, StoreCard, forms, Toaster;
  - `clients/` (ClientList, ClientDetail, ClientInfo, UnitList), `employees/EmployeeList.tsx` (öz kartı "Sən", "Bu gün: N iş"), `management/ManagerList.tsx`, `work/` (WorkTab: gün seçimi, hər işdə iş yeri göy rəngdə və "Əlavə edilib: saat"; WorkLogForm; PlacePicker: qruplu yer siyahısı + "siyahıda olmayan yer" → `place_text`).
- Usta hər şeyə baxır, yalnız **öz** iş qeydini (və fayllarını) əlavə edir, dəyişir, silir. Admin hesabı burada da hər şeyi görür, amma admin işləri admin reposundadır.
- **Bildirişlər yalnız tostla** (`lib/toast.ts` + `components/Toaster.tsx`, root layout-da). `useOnSuccess(state, fn, "uğur mesajı")` xəta və uğur tostunu özü göstərir; `ConfirmButton` uğurda "Silindi". Formun içində `alert-error` yazma.

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
| `site_texts` | key, value | saytın sabit mətnləri (111 açar) |
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
- Depo: `is_storekeeper()`, `can_manage_tools()` (= sahib və ya aktiv depo məsulu); RPC `give_tool(p_tool_id, p_employee_id, p_quantity)` və `return_tool(p_assignment_id, p_quantity)` (hissə-hissə qaytarma; qaytarılan hissə bağlı sətir kimi tarixçədə qalır; ikisi də `security invoker`, yetki RLS-dən). Trigger-lər: `tool_assignments_check_stock` (depodakından çox vermək olmur, alət sətri kilidlənir), `tools_guard_stock` (say ustalardakından az ola bilməz; ustada olan alət silinmir), `employees_guard_storekeeper` (`is_storekeeper`-i yalnız admin dəyişir), `tool_assignments_only_masters` (alət yalnız aktiv ustaya, rəhbərliyə yox).
- `handle_new_user`: yeni auth istifadəçisi → `profiles` sətri. `rls_auto_enable`: yeni cədvəldə RLS-i avtomatik açır.

### Yetkilər (RLS)
- **Üç səviyyə:** sahib (müdir, `profiles.is_owner`) → admin → usta (worker). Qonaq (anon) yalnız saytın açıq məlumatlarını oxuyur.
- Giriş edən hər kəs iş cədvəllərini oxuyur (companies, stores, employees, tools, work_logs…).
- **Depo** (`tools`, `tool_assignments`): yazmaq yalnız **depo məsulu və sahib** (`can_manage_tools()`); digər adminlər və ustalar yalnız baxır. Depo məsulu usta da ola bilər: admin panelə daxil olub Depo bölməsini idarə edir.
- **Admin**: şirkət, mağaza, usta, sayt məzmunu yazır; müraciətləri oxuyur, dəyişir, silir. İş qeydi **açmır**.
- **Rəhbərlik (`is_management`) sətirlərini yalnız sahib yazır**; sahib öz kartını dəyişə və silə bilməz.
- **Usta**: yalnız öz iş qeydini (və fayllarını) əlavə edir; dəyişmək və silmək: sahibi və ya admin.
- **Profil şəkli**: hər kəs yalnız öz şəklini, müdir hamınınkını (storage də: öz qovluğu və ya müdir).
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
- Publikasiya `supabase_realtime`-da yalnız `contact_requests`. Hadisəni RLS-ə görə yalnız admin alır.

### Miqrasiyalar (`supabase/migrations/`, admin reposunda)
- `0001`–`0054`. Ad formatı `NNNN_ad.sql`; Supabase MCP `apply_migration` ilə tətbiq et və faylı da yaz.
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
- `database.types.ts` əl ilə yenilənib; dəyişiklikdən sonra Supabase MCP `generate_typescript_types` ilə yenidən yarat və **admin reposundakı eyni fayla da** köçür.

### Hesablar və məlumat
- Sahib (müdir) = **Məmmədov Anar** (`xeyyamelizade5@gmail.com`), admin, employee id 8.
- Usta hesabı: `xeyyamalizade5@gmail.com` → **Əlizadə Xəyyam**, employee id 1. Diqqət: "e"/"a" fərqi.
- Rəhbərlik: id 7 Abdulov Ceyhun, id 8 Məmmədov Anar, id 9 Mirmanafov Mirsadiq.
- Marketlər: "Araz Market" (id 4, 200 mağaza, kodlar `ARZ-001…`), "TEST Oba Market" (id 6, 200 mağaza, `OBA-001…`). Mağazalar `excel/*-market-200.xlsx`-dən import olunub, məlumat uydurmadır. İstifadəçi "TEST" sözünü adlardan hələlik götürməmək dedi.
- Şirkətlər: Rabitə Bank (id 7, 10 filial), Qarabağ Stadion, Knightsbridge Residence, Port Baku Residence, İzmir Villa (filialsız, sabit məkan).
- 2026-10-18: iş qeydləri, tapşırıqlar və fayl qeydləri istifadəçi istəyi ilə **hamısı silindi** (baza təmizdir); `work` bucket-ində `32/` qovluğunda 2 yetim şəkil qalıb (SQL ilə silinmir, Storage panelindən əl ilə). Xəta kodları: bütün köhnə kodlar silinib; bazada Daikin SM-TS3 cədvəlindən 334 kod var (3 model, Azərbaycan dilində; ətraflı admin `CLAUDE.md`). Müraciətlər: istifadəçinin yazdığı sınaq müraciətlər var.

## Admin reposu ilə sinxron saxlanmalı olanlar
Repolar ayrıdır, kod paylaşılmır; bunlar əl ilə eyni saxlanmalıdır:
- `src/lib/database.types.ts` ↔ admin `src/lib/database.types.ts`.
- `src/lib/site-texts.ts` (`TEXT_DEFAULTS`) ↔ admin `src/components/site/textFields.ts`.
- `src/lib/site-content.ts` `ILLUSTRATED_KEYS` ↔ admin `src/components/site/EquipmentEditor.tsx`.
- Haqqımızda kart rəngləri (`app/(site)/page.tsx` `CARD_COLORS`) ↔ admin `components/site/HomeTab.tsx` `CARD_COLORS` və bazadakı check (`night|cold|ice|white`).
- Dizayn: `src/app/globals.css` ↔ admin `src/index.css` (tokenlər eynidir). Kopya komponentlər: Modal, ConfirmModal, ConfirmButton, forms, Toaster + `lib/toast.ts`, DatePicker, StoreCard, MapButton, SidePanel, Page, LogoutButton, `work/WorkLogForm`, `work/PlacePicker`, `lib/{experience,kinds,navigation,form-state}.ts`. Fərq: burada `"use client"` və `router.refresh()`, admin-də `revalidate()`.
- İş qeydi pəncərəsi: `components/work/WorkLogModal.tsx` ↔ admin `components/work/WorkLogModal.tsx` (burada `"use client"`, `useData` əvəzinə `useEffect`, vaxt Bakı saatı ilə).
- Depo: `components/depot/DepotView.tsx` ↔ admin `components/depot/DepotForms.tsx`; `lib/tools.ts` ↔ admin `actions/tools.ts`; `components/{ToolPicker,QuantityInput}.tsx` ↔ admin; `nice-scroll` sinfi ↔ admin `index.css`.
- Avatar çevirmə (`toSquareWebp`): `components/ProfileButton.tsx` ↔ admin `components/employees/AvatarUpload.tsx`.

## Responsivlik (2026-10-20-dən başlayır)
- İstifadəçi qərarı: 4 cihaz sinfi üçün tam responsivlik. Tailwind breakpoint-ləri ilə: **Mobil** < 640px (əsas sinif, prefikssiz), **Planşet** 640–1023px (`sm:`, `md:`), **Large** 1024–1535px (`lg:`, `xl:`), **XLarge** ≥ 1536px (`2xl:`). Əvvəl "mobil sonda" qaydası var idi; indi bu iş başlayır, səhifə-səhifə yoxlanır (Chrome-da `resize_window`).
- Masaüstü görünüşü (indi bəyənilən) dəyişməməlidir: düzəlişlər kiçik ekranlar üçün prefikssiz/`sm:`/`md:` siniflərlə, böyük ekranlar üçün `2xl:` ilə əlavə olunur.

## Landing: qərarlar və qalan işlər (2026-10-19)
- İstifadəçi tələbi: landing UX/UI "professional" olsun. Responsivlik 2026-10-20-də başladı (yuxarıdakı "Responsivlik" bölməsi).
- **Edilib**: hero sürətli forma (admin açıb-bağlayır, mətnlər admin-dən), rəqəmlər zolağı, necə işləyirik 3 addım, FAQ, header telefon + əsas düymə, footer sosial/WhatsApp, xəritə `hl=az`, yumşaq animasiyalar. **Ləğv/istənmir**: "Bizə etibar edənlər", xidmət təkrarının təmizlənməsi (4 kart + göy kateqoriyalar + "Xidmət növləri" qalır), hover ilə açılan menyu.
- **Modern hərəkətlər (2026-10-20, istifadəçi: "son dərəcə müasir")**: CSS `app/(site)/motion.css` (yalnız sayt layout-unda), ağır kitabxana yoxdur. Hero: tam ekran fon şəkli + `AirflowCanvas` (kondisioner barmaqlığından çıxan hava hissəcikləri, mövqe `SOURCE` nisbətləri; ekrandan çıxanda dayanır), başlıq sözbəsöz `HeroTitle` (`.word-in`), şəkil scroll ilə parallax (`.hero-parallax`; overlay `relative`-dir, yoxsa transform-lu şəkil onun üstünə çıxır). Menyu sürüşəndə şüşə (`.site-header`). Rəqəmlər şüşə kartda, altında dolan xətt (`.stat-bar`). Obyekt kartlarında `Spotlight` (kursoru izləyən işıq). "Necə işləyirik": scroll ilə dolan xətt və işıqlanan nöqtələr (`.steps`, view-timeline). Kateqoriyalar: tünd `.aurora` fonda üç bərabər şüşə kart. **Bəyənilmədi, silindi (2026-10-20): yuxarıdakı scroll irəliləyiş xətti, sürüşən xidmət zolağı (marquee), asimmetrik bento, FAQ-ın iki sütuna bölünməsi və ilk sualın açıq gəlməsi: yenidən təklif etmə.** Haqqımızda: şəkillər pərdə ilə açılır (`.reveal-wipe`; clip-path içdəki elementdədir, yoxsa IntersectionObserver açmır), kart `.float-soft`. FAQ yumşaq açılır (`::details-content`). Əlaqə kartı: `.aurora` + fırlanan haşiyə `.glow-border`. Hamısı `prefers-reduced-motion`-da dayanır.
- **Avadanlıq səhifəsi (2026-10-20)**: `EquipmentShowcase` (client): solda növlərin siyahısı (tablar, miniatür + ad + yer; ox düymələri işləyir), sağda seçilənin tünd aurora "səhnəsi": çərçivə şəklin öz nisbətindədir (kəsilmir, künclərdə boşluq yoxdur), altında ad, izah, yer nişanı; keçid animasiyası `.eq-stage` (motion.css). Bütün növlər DOM-dadır (SEO). `isIllustrated` `lib/illustrated.ts`-ə köçdü (client komponent server-only `site-content.ts`-i import edə bilmir; orada yenidən ixrac olunur). **Alt səhifə banneri `PageIntro`**: tünd `.aurora` fon, sözbəsöz başlıq (`HeroTitle`), barmaqlıq xətləri sola solur (bütün alt səhifələrdə).
- **Xidmətlər bölməsi (2026-10-20)**: `/xidmetler`: obyekt növləri hündür şəkilli kartlarda (ad və izah şəklin üstündə, fırlanan ox düyməsi, spotlight); "Bütün xidmətlər" üç sütunlu kartlar (şəkil hamısında eyni 16:10 çərçivədə — öz nisbətində qeyri-bərabər çıxırdı; küncündə ikon, ad, izah, "Ətraflı" həbi; hover: qalxma, şəkil azca yaxınlaşır, spotlight); **bəyənilmədi, silindi: hover-də çıxan şəkil və iri sətirli siyahı — yenidən təklif etmə**; çağırış tünd aurora + `.glow-border`. `/xidmet/[slug]`: şəkil pərdə ilə açılır, "Necə edirik" aurora fonda, sağdakı çağırış kartı tünd aurora + fırlanan haşiyə, digər xidmətlər spotlight kartlarda. `/xidmetler/[slug]`: şəkil pərdə ilə, yanında tünd aurora məlumat kartı, avadanlıq kartları spotlight + yaxınlaşma, "Nə edirik" aurora, digər obyektlər şəkilli kartlarda.
- **Necə işləyirik səhifəsi (2026-10-20)**: addımlar solda şaquli zaman xəttində (düyündə "01/02/03", scroll ilə dolan xətt `.timeline-fill`, düyün ekranın ortasında mavi olur `.tl-node`), sağda tam enli ağ kart (qradiyent ikon, ad, izah); **bəyənilmədi: zigzag (bir tərəf boş), nömrə üçün ayrıca kart, iri nömrələr**; "Hər işdən sonra əlinizdə" tünd aurora fonda üç şüşə kart (`.bento-card` + Spotlight); sonda Xidmətlər səhifəsindəki çağırış mətni ilə ağ `.glow-border` kart.
- **Əlaqə səhifəsi (2026-10-20)**: solda tünd aurora panel (iri telefon, Zəng et / WhatsApp, altında ünvan, iş saatı, e-poçt ikonlu sətirlərdə), sağda ikonlu sahəli "Bizə yazın" forması (tam enli tünd "Göndər"), aşağıda tam enli xəritə (z=16), ortada döyünən mavi ünvan nişanı (`.map-pulse`; **nişanın üstündə ünvan yazısı istənmir**); `ContactMap` (client): xəritəyə toxunanda (iframe fokus alır) nişan gizlənir və aşağıda "Ünvana qayıt" düyməsi çıxır, basanda iframe yenidən yüklənir (mətn `contact.map_reset`, migrasiya 0053). **"Marşrut qur"** (2026-10-20, istifadəçi istəyi): brauzerin geolocation-u ilə istifadəçinin yeri alınır, xəritə həmin nöqtədən ünvana yolu çəkir (açarsız embed `maps?saddr=LAT,LNG&daddr=ÜNVAN&output=embed`; yol, vaxt, alternativlər görünür); sonra "Naviqasiyanı aç" (Google Maps `dir/?api=1`, telefonda tətbiq) və "Ünvana qayıt"; icazə verilməsə tost. Mətnlər `contact.route*` (migrasiya 0054). Usta panelindəki "Mağaza axtarışı / Yol tap" qadağası bura aid deyil (o, ustalar üçün idi).
- **Qalan**: "Haqqımızda" şəkilləri (Fujitsu məhsul şəkilləri əvəzinə öz real foto; foto istifadəçidən gələndə, admin → Sayt → Ana səhifə), responsivlik (sonda).
- Rəqəmlər zolağında ilk 3 rəqəm bazadakı real saydır (6 usta, 6 xidmət növü, 4 obyekt növü): istifadəçi real rəqəmlərlə dəyişdirməlidir (məs. mağaza sayı, təcrübə ili); uydurma rəqəm yazma.

## Qaydalar
- `.env.local` fayllarını oxuma; parol və gizli açar yazma və oxuma. Hesab parollarını istifadəçi özü daxil edir.
- Test məlumatı uydurmadır (uydurma ünvan, telefon `+994 12 000 …`); real şəxs məlumatı uydurma. Test üçün özün yaratdığın sətirləri sonra sil.
- Supabase dashboard-da hesab və ya tənzimləmə dəyişikliyindən əvvəl icazə al.
- Shell-də `node -e` daxilində `\n` və `\D` kimi escape-lər pozulur; uzun skripti scratchpad-də `.cjs`/`.mjs` faylına yaz. Git Bash-in `/tmp`-i Node üçün başqa yerdir: Node-a scratchpad-in Windows yolunu ver (`cygpath -m`).
- Dəyişikliklərdən sonra Chrome-da yoxla, amma real məlumata yazan düymələri sınaqda basma (HMR/modal sıfırlanandan sonra koordinatla klik səhv yerə düşə bilər).
