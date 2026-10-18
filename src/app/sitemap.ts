import type { MetadataRoute } from "next";
import { getSegments, getServices } from "@/lib/site-content";
import { SITE_URL } from "@/lib/site-url";

// Açıq səhifələr; xidmət və obyekt növü səhifələri bazadan (admin paneldə əlavə olunan dərhal sitemap-a düşür)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, segments] = await Promise.all([getServices(), getSegments()]);
  const fixed = ["", "/xidmetler", "/avadanliq", "/nece-isleyirik", "/ustalarimiz", "/elaqe"];

  return [
    ...fixed.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.8 })),
    ...services.filter((s) => s.is_active).map((s) => ({ url: `${SITE_URL}/xidmet/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...segments.filter((s) => s.is_active).map((s) => ({ url: `${SITE_URL}/xidmetler/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
