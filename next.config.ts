import type { NextConfig } from "next";
import { SUPABASE_URL } from "./src/lib/env";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Sayt və usta (avatar) şəkilləri Supabase storage-dədir: next/image ölçüləyib WebP/AVIF verir. Ünvan env-dən (lib/env).
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: ["site", "avatars"].map((b) => new URL(`${SUPABASE_URL}/storage/v1/object/public/${b}/**`)),
  },
  experimental: {
    // Brauzer keşi: 30 san. ərzində eyni panel səhifəsinə qayıdanda server sorğusu (?_rsc) getmir, keşdən açılır.
    // Next 16-da dinamik səhifələr üçün standart 0-dır (hər klik serverə gedir). Canlı dəyişikliklər Realtime + TanStack ilə
    // gəlir (onun da keşi 30 san.); formdan sonra router.refresh() keşi təmizləyir.
    staleTimes: { dynamic: 30 },
    // Dev-də "Instant" (keçid ani deyil) xəbərdarlıqları yalnız `instant` ixrac edən səhifələr üçün göstərilir.
    // Açıq sayt məzmunu 5 san. keşlə bazadan gəlir (admin dəyişikliyi tez görünsün), buna görə hər səhifə üçün
    // məcburi yoxlama qırmızı/narıncı nişan çıxarırdı (build-i bloklamır).
    instantInsights: { validationLevel: "manual-warning" },
  },
  turbopack: {
    rules: {
      "*.css": {
        // CSS Modules (*.module.css) Tailwind yükləyicisindən keçmir: Next özü yerli class adlarını yaradır
        condition: { not: { path: "*.module.css" } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
