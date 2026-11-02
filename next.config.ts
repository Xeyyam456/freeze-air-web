import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Sayt şəkilləri Supabase storage-dədir: next/image ölçüləyib WebP/AVIF verir
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [new URL("https://roodclienblwrrlswmty.supabase.co/storage/v1/object/public/site/**")],
  },
  experimental: {
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
