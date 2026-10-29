import type { MileageRow } from "@/types/fuel";
import type { StepKind } from "./StepKind";

export type TodaySectionProps = { loading: boolean; row: MileageRow | null; onSave: (kind: StepKind, km: number, file: File | null) => Promise<boolean> };
