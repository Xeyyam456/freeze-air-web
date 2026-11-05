import type { MonthAttendance } from "@/types/attendance";

// Bu günün davamiyyəti (vəziyyət + seanslar): "Mənim bugünüm"
export type TodayAttendance = MonthAttendance["today"];
