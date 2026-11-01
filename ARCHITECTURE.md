# Arxitektura — Web (Next.js 16: açıq sayt + usta paneli)

Qəlib: `github.com/Xeyyam456/TikTak-Project-NextJS-Web` + admin panelin qovluq quruluşu. Köçürmə domen-domen gedir (irəliləyiş: kökdə `REFACTOR-PLAN.md`); köhnə qovluqlar (`components/`, `lib/`) boşalana qədər yeni ilə yanaşı yaşayır.

## Əsas qaydalar
1. **Hər kod faylı ən çox 100 sətir** (`.ts`, `.tsx`, `.mjs`). CSS faylları istisnadır. Yoxlama: `npm run check:lines`.
2. **Bir fayl — bir iş.** Bir komponent, bir hook, bir servis funksiyaları qrupu, bir tip.
3. **Görünüş və davranış dəyişmir.** Refaktor yalnız struktur dəyişikliyidir.
4. **Admin və web arasında ortaq paket yoxdur**: repolar ayrıdır, bir-birinə bağlı deyil; ortaq fayl yoxdur, başlanğıcda kopyalanan fayllar sonra ayrı yaşayır.

## Qovluq xəritəsi
```
src/
  app/                    YALNIZ marşrut: page.tsx view-u import edir, metadata, layout
    (site)/  (panel)/  api/  login/
  views/<Domen>/<Səhifə>/
    index.tsx             səhifə: yalnız hissələri yığır
    components/<Hissə>/   Hissə.tsx + index.ts
    hooks/  queries/  constants/  utils/  styles/
  shared/
    components/<Ad>/      Ad.tsx + Ad.module.css + index.ts (Button, FormInput, Modal...)
    hooks/  utils/
  services/<domen>/       yalnız Supabase sorğuları (brauzer); server sorğuları `*.server.ts`
  types/<domen>/<Tip>.ts  bir faylda bir tip, qovluqda index.ts barrel
  types/database/         Supabase tipləri (avtomatik bölünür, əl ilə dəyişmə)
  styles/                 globals.css: yalnız tokenlər, baza, sıfırlama
```
Domenlər: `Site` (landing, xidmətlər, əlaqə...), `Panel`, `Work`, `Tasks`, `Attendance`, `Leaves`, `Fuel`, `Depot`, `Clients`, `Employees`, `Management`, `ErrorCodes`.

## Qatlar
`app` → `views` → `queries`/`hooks` → `services` → Supabase. Komponent `supabase.from(...)` çağırmır.
`shared/` heç vaxt `views/`-dən import etmir; ortaq olan `shared/`-ə çıxır.
Server komponenti (sayt, `use cache`) və klient komponenti qarışmır: `"use client"` yalnız lazım olan faylda.

## Tiplər
- `interface`/`type` yalnız `types/` altında; komponentin `Props` tipi də.
- Baza sətirləri: `Tables<'work_logs'>` (`@/types/database`). Import: həmişə `import type`.

## Importlar
- Komponentlər birbaşa yoldan: `@/shared/components/Button` (barrel yox: Next dev barrel-in hamısını yükləyir).
- Tiplər barrel-dən: `@/types/depot`.
- Domen daxilində nisbi yol, domendən kənarda `@/`.

## Stil
- Hər komponentin öz `X.module.css`-i; qlobal class yalnız `styles/globals.css`-də (tokenlər admin `index.css` ilə eynidir).
- Rəng/ölçünü kodda yazma, CSS dəyişənini işlət.

## Data
- Usta paneli: `useData(açar, fetcher, deps)` (TanStack Query), açarlar domenin `queries/keys.ts`-ində; yazdıqdan sonra `revalidate(...)`.
- Sayt: server komponentində `services/*.server.ts` + `use cache` (`SITE_CACHE`).
- Supabase 1000 sətir həddi: ay/il sorğuları `fetchAll` ilə.

## Admin ↔ web kopyaları
- `src/shared/**` və `src/types/shared/**` hər repoda öz kopyasıdır. Sinxron skript YOXDUR: bir repoda dəyişiklik digərinə avtomatik getmir, lazımdırsa əl ilə köçürülür.
- Skript hook/portal/hadisə işlədən `.tsx`-ə `"use client"` əlavə edir; qalanı (Button, Input) server komponentində də işləyir.

## Stil (CSS Modules)
- **Yeri**: komponent qovluğunda yalnız `X.tsx` + `index.ts` varsa CSS onun yanında (`Page/Page.module.css`); alt qovluqlar (`components/`, `hooks/`) varsa `styles/` qovluğunda (`views/Site/Trust/styles/HowSteps.module.css`). Ortaq komponentlərin CSS-i `shared/styles/`.
- **Hər modulun ilk sətri** `@layer theme, base, components, utilities;`, sonra `@layer components { ... }`: modul Tailwind-dən əvvəl yüklənəndə `components` qatı `base`-dən (preflight) əvvələ düşməsin; qatsız CSS Tailwind utility-lərini (`className="w-full"`) üstələyər.
- **`next.config.ts`**: `turbopack.rules["*.css"]` Tailwind yükləyicisini `*.module.css` üçün söndürür (`condition: { not: { path: "*.module.css" } }`). Bunsuz modullar qlobal CSS kimi emal olunur və `s.root` `undefined` olur.
- **Qlobal marker class-lar** (modulların `:global(...)` ilə oxuduğu): `side-panel` (Card/Field/Button yan paneldə dəyişir), `nav-label`, `nice-scroll`, `link`, `muted`. Landing animasiya utilitləri (`site-wrap`, `hero-in`, `reveal`, `aurora`, `glow-border`, `stat-bar`, `bento-card`, `float-soft`, `hero-parallax`) bir çox faylda işləndiyi üçün `app/(site)/motion.css` və `globals.css`-də qlobal qalır.
- Animasiya adı (`@keyframes`) modulda lokaldır: keyframe-i həmin faylda yaz.

## Ortaq UI komponentləri
- Xam `className="btn|icon-btn|card|field|label ..."` yazma. Komponentlər: `<Button as="a" variant size>`, `<IconButton danger>`, `<Card as="li" link>`, `<CardTitle>`, `<Input|Textarea|Select|FieldButton>`, `<Label>`, `<FormField label>`, `<IconTile>`, `<CodeBadge>`, `<SearchField>`, `<CarPlate>`, `<LogoMark>` (hamısı `@/shared/components/...`, polimorf: `as`). `ConfirmButton`: `variant size` və ya `icon danger`.
- Komponent yoxdursa əvvəl `shared/components`-ə əlavə et. Feature qovluğunun kökündə yalnız `index.tsx`: `components/<Hissə>/`, `hooks/`, `utils/`.
