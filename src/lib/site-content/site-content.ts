import { cacheLife, cacheTag } from "next/cache";
import { SITE_CACHE, SITE_TAG } from "@/lib/site-cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Segment } from "@/types/site";
import type { Service } from "@/types/site";
import type { Equipment } from "@/types/site";

export { ILLUSTRATED_KEYS, isIllustrated } from "@/lib/illustrated";

// "Xidmətlər" və "Avadanlıq" bölmələrinin məzmunu: admin panelindəki "Sayt" səhifəsindən idarə olunur.
// Keşdə saxlanır, hər dəqiqə yenilənir. Cookie-siz klient: qonaq yalnız aktiv sətirləri görür.
function publicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function getSegments(): Promise<Segment[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicClient().from("site_segments").select("*").order("sort").order("id");
  return data ?? [];
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicClient().from("site_services").select("*").order("sort").order("id");
  return data ?? [];
}

export async function getEquipment(): Promise<Equipment[]> {
  "use cache";
  cacheLife(SITE_CACHE);
  cacheTag(SITE_TAG);
  const { data } = await publicClient().from("site_equipment").select("*").order("sort").order("id");
  return data ?? [];
}

// Obyekt növünə bağlı avadanlıqlar, obyektdə seçildiyi sırada (gizli/silinmiş olanlar düşür)
export function segmentEquipment(segment: Segment, all: Equipment[]): Equipment[] {
  return segment.equipment.map((key) => all.find((e) => e.key === key)).filter((e): e is Equipment => !!e);
}
