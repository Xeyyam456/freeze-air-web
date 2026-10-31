import type { EquipmentItem } from "./EquipmentItem";
import type { SegmentItem } from "./SegmentItem";
import type { TextsProps } from "./TextsProps";

export type SegmentBlockProps = TextsProps & { segment: SegmentItem; equipment: EquipmentItem[] };
