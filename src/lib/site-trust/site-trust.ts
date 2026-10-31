import { cacheLife, cacheTag } from "next/cache";
import { SITE_CACHE, SITE_TAG } from "@/lib/site-cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { SiteStat } from "@/types/site";
import type { SiteFaq } from "@/types/site";

const publicClient = () =>
  createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });

export async function getStats(): Promise<SiteStat[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicClient().from("site_stats").select("id, value, label").order("sort").order("id");
  return data ?? [];
}

export async function getFaq(): Promise<SiteFaq[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicClient().from("site_faq").select("id, question, answer").order("sort").order("id");
  return data ?? [];
}
