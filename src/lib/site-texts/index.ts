import { getTexts } from "@/services/site/fetchSiteTexts.server";
import { TEXT_DEFAULTS } from "./defaults";
import type { TextKey } from "@/types/site";

export { TEXT_DEFAULTS };

// Siyahı mətni → bəndlər (hər sətir bir bənd)
export const lines = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);

// Səhifə başlığı (brauzer tabı): "Səhifə — Brend"
export async function pageTitle(key: TextKey) {
  const t = await getTexts();
  return `${t[key]} — ${t["brand.name"]}`;
}
