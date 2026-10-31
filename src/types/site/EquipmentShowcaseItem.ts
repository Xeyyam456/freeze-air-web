import type { Equipment } from "@/lib/site-content";

export type EquipmentShowcaseItem = Pick<Equipment, "id" | "key" | "title" | "text" | "place" | "image_url">;
