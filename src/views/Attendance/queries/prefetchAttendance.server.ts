import { fetchAttendanceEmployees } from "@/services/attendance/fetchAttendanceEmployees";
import { fetchMonthAttendance } from "@/services/attendance/fetchMonthAttendance";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { PrefetchEntry } from "@/types/panel";
import type { DbClient } from "@/types/shared";
import { ATTENDANCE_EMPLOYEES_KEY } from "./useAttendanceEmployees";

// Bu ayın davamiyyəti (bütün ustalar). Açar və dəyər useMonthAttendance ilə eynidir: ["month-attendance", "YYYY-MM"] → { month, d }.
// Panel ("Mənim bugünüm") və Davamiyyət səhifəsi eyni açarı işlədir.
export async function prefetchMonthAttendance(db: DbClient): Promise<PrefetchEntry> {
  const m = todayBaku().slice(0, 7);
  return { key: ["month-attendance", m], data: { month: m, d: await fetchMonthAttendance(m, db) } };
}

// Davamiyyət səhifəsi: ayın davamiyyəti + cədvəlin ustaları
export async function prefetchAttendance(db: DbClient): Promise<PrefetchEntry[]> {
  const [month, employees] = await Promise.all([prefetchMonthAttendance(db), fetchAttendanceEmployees(db)]);
  return [month, { key: [ATTENDANCE_EMPLOYEES_KEY], data: employees }];
}
