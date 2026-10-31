import type { HowStep } from "./HowStep";
import type { TextsProps } from "./TextsProps";

export type HowStepCardProps = TextsProps & { step: HowStep; index: number };
