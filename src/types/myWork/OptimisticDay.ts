import type { TodayAttendance } from "./TodayAttendance";

// Optimistik vəziyyət: base — hansı real vəziyyətin üstündə qurulub (real dəyişəndə düşür), day — ekranda göstərilən
export type OptimisticDay = { base: TodayAttendance | undefined; day: TodayAttendance | undefined };
