import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Axtarış sistemləri yalnız açıq saytı indeksləyir; usta paneli və giriş bağlıdır
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/panel", "/sirketler", "/magazalar", "/ustalar", "/tapshiriqlar", "/statistika", "/rehberlik", "/xeta-kodlari", "/depo"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
