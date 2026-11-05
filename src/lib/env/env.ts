// Bütün env dəyişənləri yalnız burada oxunur; ünvan dəyişəndə yalnız .env / Vercel env dəyişir.
// NEXT_PUBLIC_* adları tam yazılmalıdır: Next onları build zamanı brauzer koduna yerləşdirir.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Saytın əsas ünvanı (sitemap, robots, Open Graph). Canlıda NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Yalnız serverdə: /api/revalidate-ə CORS icazəsi olan admin paneli.
export const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN ?? "http://localhost:5173";
