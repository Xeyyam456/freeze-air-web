import type { LucideIcon } from "lucide-react";
import type { PickerItem } from "./PickerItem";

export type PickerButtonProps = {
  selected: PickerItem | null;
  open: boolean;
  empty: boolean;
  icon: LucideIcon;
  placeholder: string;
  emptyLabel: string;
  onClick: () => void;
};
