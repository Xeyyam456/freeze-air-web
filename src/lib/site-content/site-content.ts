import type { Segment } from "@/types/site";
import type { Equipment } from "@/types/site";

export { ILLUSTRATED_KEYS, isIllustrated } from "@/lib/illustrated";

// Obyekt növünə bağlı avadanlıqlar, obyektdə seçildiyi sırada (gizli/silinmiş olanlar düşür).
// Məzmunun özü services/site/fetchSiteContent.server.ts-dən gəlir.
export function segmentEquipment(segment: Segment, all: Equipment[]): Equipment[] {
  return segment.equipment.map((key) => all.find((e) => e.key === key)).filter((e): e is Equipment => !!e);
}
