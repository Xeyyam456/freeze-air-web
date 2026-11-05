@AGENTS.md

# CLAUDE.md — Freeze Air Service: Sayt və usta paneli (Next.js)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ünsiyyət
- Hər şey Azərbaycan dilində: cavablar, izahlar, kod şərhləri. Kod, identifikatorlar, texniki terminlər olduğu kimi.
- Qısa, birbaşa. İstifadəçi ilə məcburi razılaşma yoxdur: səhvi açıq de, səbəbini qısa izah et, daha yaxşı variant təklif et.
- İstifadəçi "etmə, hələlik cavab ver" deyəndə yalnız cavab ver, kod yazma.

## Arxitektura qaydaları (DAİMİ — hər yeni xüsusiyyət və düzəliş üçün; 2026-10-28)
- **Kod yazmazdan əvvəl `ARCHITECTURE.md`-ni oxu.** Qovluq quruluşu, qatlar, tiplər, stil, importlar oradadır. Layihə daim yeni xüsusiyyətlərlə böyüyəcək: yeni kod həmişə bu qaydalarla yazılır, köhnə qəlibə (böyük fayl, komponentdə `supabase.from`, inline tip, qlobal CSS) qayıtma.
- **Hər kod faylı max 100 sətir** (CSS xaric). `npm run check:lines`: yeni fayl 100-ü keçə bilməz, köhnə uzun fayl (`scripts/lines-baseline.json`) böyüyə bilməz — ona toxunursansa, böl. Bölüb bitirəndə `npm run check:lines -- --update-baseline`. Kök repoda pre-commit hook (`.githooks/pre-commit`) bunu yoxlayır; yeni kompüterdə bir dəfə `git config core.hooksPath .githooks`.
- Refaktorun irəliləyişi: kökdə `REFACTOR-PLAN.md` (yeni sessiyada oradan davam et).

## Ətraflı sənədlər (`docs/`, lazım olanda oxu)

- `docs/routes.md`: Marşrut cədvəli, açıq saytın məzmun axını, usta paneli bölmələri.
- `docs/database.md`: Cədvəllər, funksiyalar, yetkilər, storage, realtime, miqrasiyalar, hesablar.
- `docs/responsive.md`: Responsivlik qərarları, admin ilə qrup işi təsiri, landing qərarları, usta paneli mobil cilası.
- `ARCHITECTURE.md`: qovluq quruluşu, qatlar, stil və komponent qaydaları (kod yazmazdan əvvəl oxu).
- Kökdə `REFACTOR-PLAN.md`: refaktorun irəliləyişi.

## Sistem haqqında (iki repo, bir baza)
Kondisioner servis şirkəti **Freeze Air Service** üçün sistem: ustalar, müqavilə bağlanan şirkətlər (filialları) və marketlər (mağazaları), alətlər (depo), ustaların gündəlik iş qeydləri, rəhbərlik, açıq sayt.

| Repo | Nədir | Kim üçün | Port |
|---|---|---|---|
| **web** (bu repo) | Next.js 16 | açıq sayt (qonaq) + usta paneli (baxış, yalnız öz işləri) | 3000 |
| **admin** (ayrı repo) | Vite 8 + React 19 SPA | adminlər və rəhbərlik: hər şeyi idarə edir, saytın məzmununu da | 5173 |

İkisi də **eyni Supabase layihəsini** işlədir. Admin funksiyaları bu repoda **yoxdur**. `supabase/` qovluğu (miqrasiyalar + Edge Function) **admin reposuna aiddir**; baza dəyişikliyi lazım olanda miqrasiya orada yazılır, Supabase MCP ilə tətbiq olunur.

## Layihə strukturu, git və iş qaydaları (admin və web fayllarında eynidir)
- **Qovluqlar** (`D:\Praqramlasirma\Projects\kondisioner-servis\`): `admin/` (Vite, 5173), `web/` (Next.js, 3000), `supabase/` (miqrasiyalar `0001`–`0102`, hamısı bazada tətbiq olunub + Edge Function-lar `admin-accounts`, `push`; repolar ayrılanda `admin/supabase/`-a köçürüləcək), `excel/` (test və import faylları, heç bir repoya aid deyil, git-ignore). **Kökdə CLAUDE.md yoxdur**: hər platformanın öz faylı tamdır, işlədiyin platformanın qovluğundan başla (`admin/CLAUDE.md` və ya `web/CLAUDE.md`).
- **Yeni kompüterdə qurmaq**: `git clone https://github.com/Xeyyam456/kondisioner-servis.git`; `admin/` və `web/`-də `npm install`; hər qovluqda `.env.example`-ı `.env.local` adı ilə kopyala və publishable açarı doldur (Supabase → Project Settings → API); `npm run dev`. Gizli (service role) açar lokalda lazım deyil. Baza və Edge Function Supabase-dədir (kopyalanmır).
- **Git**: hələlik **bir repo** (kök, budaq `main`): `admin/`, `web/`, `supabase/` birlikdə commit və push olunur, sonda ayrılacaq (məs. `git subtree split --prefix=admin`). **Ayrı deploy repoları** (2026-10-19): `web/` → `github.com/Xeyyam456/freeze-air-web`, `admin/` → `github.com/Xeyyam456/freeze-air-admin` (ikisi private, budaq `main`, remote adları `web` və `admin`; Vercel bunlardan deploy edir). Kök repo işləmə yeri qalır, bu ikisi onun `subtree` güzgüsüdür: **ayrı repolarda birbaşa dəyişiklik etmə**. **Commit qaydası (2026-10-27)**: iş boyu hər bitmiş və yoxlanmış addım **dərhal ayrıca lokal commit** olunur (soruşmadan; GitHub təqvimində hər iş günü görünsün). **Push qaydası (istifadəçi qərarı, 2026-10-20)**: push **yalnız istifadəçi deyəndə** ("push et", "pushla"); deyəndə dəyişən hər şey **həm kökə, həm də aid ayrı repoya** push olunur: `git push origin main`, sonra dəyişən qovluğa görə `git subtree push --prefix=web web main` və/və ya `git subtree push --prefix=admin admin main` (yalnız `supabase/` dəyişibsə ayrı repo lazım deyil). Yarımçıq və ya uğursuz iş push olunmur; istifadəçi "hələ push etmə" desə gözlə. Commit mesajı Azərbaycanca. Commitdən əvvəl: admin `npx tsc -b`, web `npx tsc --noEmit` + `npx eslint src`. `.env*` və `excel/` repoya düşmür, `.gitattributes`: LF. İstifadəçi "hələ push etmə, xoşuma gəlməsə geri dönək" deyəndə yeni funksiya `feature/...` budağında commit olunur; təsdiqdən sonra `main`-ə `--ff-only` + push (bazadakı miqrasiyalar budaqla geri qayıtmır: miqrasiya faylının başına `drop` əmrlərini yaz).
- **Dev serverləri Claude özü idarə edir** (2026-10-17-dən, istifadəçi istəyi): `admin/` → `npm run dev` (5173), `web/` → `npm run dev` (3000), fon prosesləri. Chrome-da hər biri üçün ayrı tab açıq qalır (admin, landing, usta paneli), tabları bağlama. Yaddaş azalıb server ölərsə yenidən başlat və tabı yenilə.
- **Bazaya yazma (Claude Code icazələri)**: Supabase MCP `apply_migration` üçün icazə qaydası var (istifadəçi `/permissions` ilə əlavə edib; yoxdursa auto-rejim "Production Deploy" ilə bloklayır). Claude öz icazə fayllarını (`.claude/settings*.json`) dəyişə bilmir ("Self-Modification" bloku): qayda lazımdırsa istifadəçi `/permissions` ilə əlavə edir. Bloklanan miqrasiyanı dolayı yolla keçməyə çalışma: SQL-i istifadəçiyə ver, o, Supabase paneli → SQL Editor-də (`https://supabase.com/dashboard/project/roodclienblwrrlswmty/sql/new`) işlədir. Toplu silmə və `drop`-dan əvvəl hədəfə (sətir sayı, nələr silinir) bax və istifadəçinin sözünü yoxla.

## Komandalar
Test yoxdur. Yoxlama = tip yoxlaması + lint + brauzerdə canlı test.
- `npm run dev` (port 3000, fonda), `npx tsc --noEmit`, `npx eslint src`. **Dev işləyərkən `next build` işlətmə.**
- **Bundle limiti** (2026-11-02): `npm run build` sonunda `postbuild` → `scripts/check-bundle.mjs` (`/` ≤ 215 KB, `/panel` ≤ 340 KB JS gzip, prerender HTML-dən). Keçilsə build uğursuz olur, Vercel deploy etmir; limiti qaldırmazdan əvvəl ağır client importu axtar.
- "Turbopack is not supported … native bindings" + "An Application Control policy has blocked this file" = Windows Smart App Control imzasız `next-swc.win32-x64-msvc.node`-u bloklayır (2026-10-20 olub, istifadəçi söndürdü). Müvəqqəti yol `npx next dev --webpack`; həll Windows Security → App & browser control → Smart App Control → Off (istifadəçi özü edir).
- Turbopack bəzən `globals.css` dəyişikliyini götürmür → port 3000-dəki node prosesini PowerShell ilə öldür (`Get-NetTCPConnection -LocalPort 3000 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`), sonra `rm -rf .next && npm run dev`.
- Səhifə hər ~1 saniyədə özü yenidən yüklənir (log-da hər sorğudan sonra "✓ Compiled in Nms", konsolda dövri "[Fast Refresh] rebuilding"; mənbə faylı dəyişmir) = köhnə `.next` keşi (2026-10-21 olub). Eyni həll: prosesi öldür, `rm -rf .next && npm run dev`.
- Yaddaş azalanda dev serverin daxili worker-ləri ölə bilər ("Jest worker encountered … child process exceptions"): prosesi öldürüb yenidən başlat. Claude Code fondakı serveri yaddaş azalanda özü dayandıra bilər: istifadəçiyə de, istəsə başlat.
- Bazada yeni sütun əlavə olunanda `use cache` köhnə məlumatı 5 dəqiqəyə qədər qaytara bilər (məs. yeni `slug` görünməz, səhifə 404). Gözləmək və ya `rm -rf .next` + yenidən başlatmaq lazımdır. `notFound()` Suspense daxilində olanda curl 200 qaytarır, yoxlamanı brauzerdə və ya məzmunla (`grep`) et.
- Brauzer testi: Claude in Chrome, ayrı açıq saxlanan tabda (`localhost:3000/panel`); usta hesabı (Əlizadə Xəyyam) brauzerdə artıq daxil olub. Parol yazma. Dev serveri Claude özü fonda işlədir (yuxarıda "Layihə strukturu, git və iş qaydaları").
- **Next dev göstəricisi "1 Issue"** = real xəta: konsola bax (`read_console_messages`). Client komponentdə render zamanı `new Date()` oxumaq Cache Components-də xətadır → komponenti `<Suspense>` daxilində işlət (`/panel`-də `WorkHistory`) və ya tarixi effektdə oxu.

## Stack və Next 16 xüsusiyyətləri
- Next.js 16.4.1 (App Router, Turbopack, **Cache Components**), React 19, Tailwind v4, TypeScript, `@supabase/ssr`, lucide-react. Kod yazmazdan əvvəl `node_modules/next/dist/docs/`-a bax (AGENTS.md).
- Middleware yerinə `src/proxy.ts`: auth yönləndirmə; `PUBLIC_PATHS` + `/xidmetler/` və `/xidmet/` prefiksləri açıqdır, qalanı girişlə.
- Klik olunan hər şeydə əl kursoru (`globals.css` base qaydası). Yumşaq sürüşmə (Lenis) sınanıb və istifadəçinin istəyi ilə **silinib**: yenidən təklif etmə.
- cookies, params və runtime data `<Suspense>` daxilində; server `createClient()` `await connection()` çağırır.
- Açıq məlumat (sayt məzmunu) `"use cache"` + `cacheLife(SITE_CACHE)` ilə (`lib/site-cache/`: **stale 30, revalidate 60, expire 1 gün** — 2026-11-02 performans), **cookie-siz** klientlə (`createClient` from `@supabase/supabase-js`, `persistSession: false`). Admin dəyişikliyi `/api/revalidate` ilə **dərhal** görünür (admin `revalidateSite()`; canlıda admin `VITE_SITE_URL` və web `ADMIN_ORIGIN` env-ləri lazımdır); o çağırış alınmasa ehtiyat 60 san. Əvvəl revalidate 5/expire 60 idi: Next 16 belə keşi "qısa ömürlü" sayıb səhifəni hər sorğuda render edirdi (LCP 5,7 s, CLS 0,32).
- **Landing Suspense (2026-10-18)**: `app/(site)/layout.tsx`-də header, səhifə (`<main>`) və footer ayrı `<Suspense>`-dədir (qısa ömürlü keş dövründən qalıb; götürmək ölçüdə fayda vermədi, 2026-11-02). "Instant" xəbərdarlığı `next.config.ts`-də `experimental.instantInsights.validationLevel: "manual-warning"` ilə söndürülüb. `next.config` dəyişəndə dev serveri yenidən başlat.
- **Push bildirişləri (2026-11-02)**: `public/sw.js` (yalnız push, keş yox; proxy-də `/sw.js` açıq), `lib/push` (VAPID açıq açarı, `enablePush`/`refreshPush`; iPhone-da yalnız ana ekrandan açılan paneldə), `services/push`, Panel-də `components/panel/PushPrompt` ("Bildirişləri aç"); **Elanlar** `/elanlar` (`views/Announcements`, canlı; rəhbərlik kartı olana form da görünür). Elan bildirişi `/elanlar`-ı açır (0102). Baza və hadisələr: admin `docs/database.md` 0096–0099.
- **PWA (2026-11-02)**: usta paneli telefonda "Ana ekrana əlavə et" ilə tam ekran tətbiq kimi açılır. Manifest `app/panel.webmanifest/route.ts` (start_url `/panel`), ikonlar `app/app-icon/[size]/route.tsx` (`ImageResponse`, 180/192/512, statik; maskable üçün qar dənəsi 50%), `(panel)/layout.tsx` `metadata.manifest` + `appleWebApp` + `viewport.themeColor` — açıq saytda manifest **yoxdur** (qonağa quraşdırma təklifi çıxmasın). Proxy-də `/panel.webmanifest` və `/app-icon/` açıqdır (brauzer manifesti cookie-siz çəkir). Service worker/oflayn keş **yoxdur** (deploy-dan sonra köhnə kod riski; lazım olsa ayrıca).
- Mutasiyadan sonra client komponentdə `router.refresh()`.
- React 19 `<form action>` göndərəndən sonra formanı sıfırlayır, xətada da. Ona görə `ActionForm` / `onSubmit` + `startTransition(() => action(fd))` işlənir.
- Lint qaydaları: `react-hooks/refs` (renderdə ref oxuma yox), `set-state-in-effect`; açıq saytın storage şəkilləri `next/image` ilə (`next.config.ts` `images.remotePatterns`: Supabase `site` bucket; hero `preload fetchPriority="high"`, hər yerdə `sizes`); usta paneli/loqo şəkilləri `<img>` + `eslint-disable-next-line @next/next/no-img-element`.
- `.env.local` (git-ignored, **oxuma**): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Gizli açar bu layihədə işlənmir; `SUPABASE_SECRET_KEY` sətri varsa silinməlidir. Kodda env yalnız `lib/env`-də oxunur (`SUPABASE_URL`, `SUPABASE_KEY`, `SITE_URL`, `ADMIN_ORIGIN`); başqa yerdə `process.env` yazma.

## Admin reposu ilə sinxron saxlanmalı olanlar
Repolar ayrıdır, kod paylaşılmır; bunlar əl ilə eyni saxlanmalıdır:
- Baza tipləri: `src/types/database/` — hər ikisinə `scripts/split-db-types.mjs` yazır (kökdə).
- `src/lib/site-texts.ts` (`TEXT_DEFAULTS`) ↔ admin `src/pages/Site/constants/textGroups/`.
- `src/lib/site-content.ts` `ILLUSTRATED_KEYS` ↔ admin `src/pages/Site/constants/siteConstants.ts`.
- Haqqımızda kart rəngləri (`app/(site)/page.tsx` `CARD_COLORS`) ↔ admin `pages/Site/constants/homeConstants.ts` `CARD_COLORS` və bazadakı check (`night|cold|ice|white`).
- Dizayn: `src/app/globals.css` ↔ admin `src/index.css` (tokenlər eynidir). Kopya komponentlər: Modal, ConfirmModal, ConfirmButton, forms, Toaster + `lib/toast.ts`, DatePicker, StoreCard, MapButton, SidePanel, Page, LogoutButton, `work/WorkLogForm`, `work/PlacePicker`, `lib/{experience,kinds,navigation,form-state}.ts`. Fərq: burada `"use client"` və `router.refresh()`, admin-də `revalidate()`.
- İş qeydi pəncərəsi: `components/work/WorkLogModal/` ↔ admin `components/work/WorkLogModal/` (burada `"use client"`, `useData` əvəzinə `useEffect`, vaxt Bakı saatı ilə).
- Depo, Yanacaq, `shared/` və bəzi `lib/` faylları admin-dən bir dəfə kopyalanıb, **indi ayrıdır, sinxron skript yoxdur (silindi 2026-10-30)**; hər repo öz kodunu dəyişir. Web-ə məxsus: `views/Depot/index.tsx`, "Alətlərim" `views/MyTools/` + `services/myTools/` + `types/myTools/`. `components/{ToolPicker,QuantityInput}.tsx` ↔ admin (əl ilə); `nice-scroll` sinfi ↔ admin `index.css`.
- Avatar çevirmə (`toSquareWebp`): `views/Profile/` (useProfilePhoto + utils) ↔ admin `shared/components/AvatarUpload/`.

## Qaydalar
- `.env.local` fayllarını oxuma; parol və gizli açar yazma və oxuma. Hesab parollarını istifadəçi özü daxil edir.
- Test məlumatı uydurmadır (uydurma ünvan, telefon `+994 12 000 …`); real şəxs məlumatı uydurma. Test üçün özün yaratdığın sətirləri sonra sil.
- Supabase dashboard-da hesab və ya tənzimləmə dəyişikliyindən əvvəl icazə al.
- Shell-də `node -e` daxilində `\n` və `\D` kimi escape-lər pozulur; uzun skripti scratchpad-də `.cjs`/`.mjs` faylına yaz. Git Bash-in `/tmp`-i Node üçün başqa yerdir: Node-a scratchpad-in Windows yolunu ver (`cygpath -m`).
- Dəyişikliklərdən sonra Chrome-da yoxla, amma real məlumata yazan düymələri sınaqda basma (HMR/modal sıfırlanandan sonra koordinatla klik səhv yerə düşə bilər).
