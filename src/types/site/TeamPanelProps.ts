import type { TextsProps } from "./TextsProps";
import type { WorkerKind } from "./WorkerKind";

export type TeamPanelProps = TextsProps & { counts: Record<WorkerKind, number> };
