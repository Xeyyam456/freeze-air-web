import type { EquipmentItem } from "./EquipmentItem";
import type { TextsProps } from "./TextsProps";

export type EquipmentCardsProps = TextsProps & { equipment: EquipmentItem[] };
