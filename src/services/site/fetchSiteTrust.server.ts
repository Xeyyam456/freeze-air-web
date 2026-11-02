import { cacheLife, cacheTag } from "next/cache";
import { publicSiteClient } from "@/lib/site-client";
import { SITE_CACHE, SITE_TAG } from "@/lib/site-cache";
import type { SiteStat } from "@/types/site";
import type { SiteFaq } from "@/types/site";

// Ana səhifənin rəqəmlər zolağı və tez-tez verilən suallar
export async function getStats(): Promise<SiteStat[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicSiteClient().from("site_stats").select("id, value, label").order("sort").order("id");
  return data ?? [];
}

export async function getFaq(): Promise<SiteFaq[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicSiteClient().from("site_faq").select("id, question, answer").order("sort").order("id");
  return data ?? [];
}
