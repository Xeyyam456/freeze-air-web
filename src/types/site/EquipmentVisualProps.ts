import type { Equipment } from "@/types/site";

export type EquipmentVisualProps = {
  item: Pick<Equipment, "key" | "title" | "image_url">;
  className?: string;
  artClassName?: string;
};
