import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Dev-də "Instant" (keçid ani deyil) xəbərdarlıqları yalnız `instant` ixrac edən səhifələr üçün göstərilir.
    // Açıq sayt məzmunu 5 san. keşlə bazadan gəlir (admin dəyişikliyi tez görünsün), buna görə hər səhifə üçün
    // məcburi yoxlama qırmızı/narıncı nişan çıxarırdı (build-i bloklamır).
    instantInsights: { validationLevel: "manual-warning" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
