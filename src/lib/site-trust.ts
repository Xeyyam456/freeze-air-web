import { cacheLife, cacheTag } from "next/cache";
import { SITE_CACHE, SITE_TAG } from "@/lib/site-cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Ana səhifənin inam hissələri (admin panelində "Sayt" → "Etibar və suallar"): rəqəmlər zolağı və suallar.
// Cədvəl boşdursa həmin bölmə saytda göstərilmir. Cookie-siz klient, keşdə (SITE_TAG ilə dərhal təmizlənir).
export type Stat = { id: number; value: string; label: string };
export type Faq = { id: number; question: string; answer: string };

const publicClient = () =>
  createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });

export async function getStats(): Promise<Stat[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicClient().from("site_stats").select("id, value, label").order("sort").order("id");
  return data ?? [];
}

export async function getFaq(): Promise<Faq[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicClient().from("site_faq").select("id, question, answer").order("sort").order("id");
  return data ?? [];
}
