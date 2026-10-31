import type { EquipmentShowcaseItem } from "./EquipmentShowcaseItem";

export type EquipmentTabButtonProps = {
  item: EquipmentShowcaseItem;
  index: number;
  on: boolean;
  tabRef: (el: HTMLButtonElement | null) => void;
  onSelect: () => void;
  onKey: (e: React.KeyboardEvent) => void;
};
