import type { StepKind } from "./StepKind";

export type StepProps = {
  kind: StepKind;
  value: number | null;
  photo: string | null;
  at: string | null;
  min?: number;
  max?: number;
  disabled?: boolean;
  onSave: (km: number, file: File | null) => Promise<boolean>;
};
