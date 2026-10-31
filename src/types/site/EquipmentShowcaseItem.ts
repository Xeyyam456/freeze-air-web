import type { Equipment } from "@/types/site";

export type EquipmentShowcaseItem = Pick<Equipment, "id" | "key" | "title" | "text" | "place" | "image_url">;
