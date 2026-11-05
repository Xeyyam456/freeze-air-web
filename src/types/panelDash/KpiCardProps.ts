import type { MonthSummary, MyDayStats } from "@/types/myWork";

// stats: bugünkü göstəricilər (null = yüklənir); month: cari ayın xülasəsi; prev: əvvəlki ayın tam iş sayı
export type KpiCardProps = { stats: MyDayStats | null; month: MonthSummary | null; prev: number | null; todayD: number; m: number };
