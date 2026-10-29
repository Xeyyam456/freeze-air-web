import type { Period } from "@/types/fuel";

export type PeriodTabsProps = { period: Period; label: string; atEnd: boolean; onPeriod: (p: Period) => void; onShift: (dir: 1 | -1) => void };
