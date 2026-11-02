import { cacheLife, cacheTag } from "next/cache";
import { publicSiteClient } from "@/lib/site-client";
import { SITE_CACHE, SITE_TAG } from "@/lib/site-cache";
import type { Segment } from "@/types/site";
import type { Service } from "@/types/site";
import type { Equipment } from "@/types/site";

// "Xidmətlər" və "Avadanlıq" bölmələrinin məzmunu: admin panelindəki "Sayt" səhifəsindən idarə olunur.
// Keşdə saxlanır, hər dəqiqə yenilənir. Cookie-siz klient: qonaq yalnız aktiv sətirləri görür.
export async function getSegments(): Promise<Segment[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicSiteClient().from("site_segments").select("*").order("sort").order("id");
  return data ?? [];
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicSiteClient().from("site_services").select("*").order("sort").order("id");
  return data ?? [];
}

export async function getEquipment(): Promise<Equipment[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicSiteClient().from("site_equipment").select("*").order("sort").order("id");
  return data ?? [];
}
