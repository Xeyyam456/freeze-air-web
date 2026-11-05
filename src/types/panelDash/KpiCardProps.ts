import type { MonthSummary, MyDayStats } from "@/types/myWork";
import type { MiniBarsProps } from "./MiniBarsProps";

// stats: bugünkü göstəricilər (null = yüklənir); month: cari ayın xülasəsi; prev: əvvəlki ayın tam iş sayı;
// week: son 7 günün sütunları (ay sərhədini keçir)
export type KpiCardProps = { stats: MyDayStats | null; month: MonthSummary | null; prev: number | null; todayD: number; week: MiniBarsProps["bars"] };
