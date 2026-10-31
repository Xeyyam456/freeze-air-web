import { cacheLife, cacheTag } from "next/cache";
import { publicSiteClient } from "@/lib/site-client";
import { SITE_CACHE, SITE_TAG } from "@/lib/site-cache";
import { TEXT_DEFAULTS } from "./defaults";
import type { TextKey } from "@/types/site";
import type { Texts } from "@/types/site";

export { TEXT_DEFAULTS };

// Bütün mətnlər bir sorğu ilə; keşdə saxlanır və hər dəqiqə yenilənir
export async function getTexts(): Promise<Texts> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);

  const { data } = await publicSiteClient().from("site_texts").select("key, value");

  const texts: Texts = { ...TEXT_DEFAULTS };
  for (const row of data ?? []) {
    if (row.key in texts && row.value.trim()) texts[row.key as TextKey] = row.value.trim();
  }
  return texts;
}

// Siyahı mətni → bəndlər (hər sətir bir bənd)
export const lines = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);

// Səhifə başlığı (brauzer tabı): "Səhifə — Brend"
export async function pageTitle(key: TextKey) {
  const t = await getTexts();
  return `${t[key]} — ${t["brand.name"]}`;
}
