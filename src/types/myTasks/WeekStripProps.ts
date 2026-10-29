import type { WeekRow } from "./WeekRow";

// me: undefined = yüklənir, null = əməkdaş kartı yoxdur
export type WeekStripProps = { day: string; today: string; from: string; rows: WeekRow[]; me: number | null | undefined; onDay: (day: string) => void };
