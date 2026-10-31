// Saytın əsas ünvanı (sitemap, robots, Open Graph). Canlıya çıxanda .env-də NEXT_PUBLIC_SITE_URL yazılır.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
