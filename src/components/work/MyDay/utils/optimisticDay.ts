import type { MonthAttendance } from "@/types/attendance";
import { mins } from "./dayTime";

type Day = MonthAttendance["today"];

// Optimistik vəziyyət: düymə basılan an ekranda nəticə görünür (bazanın cavabı və Realtime gözlənilmir).
// İşə gəldim / yenidən işə çıxdım / icazədən imtina: yeni açıq seans əlavə olunur
export function checkedIn(day: Day | undefined, at: string): Day {
  const sessions = [...(day?.presence?.sessions ?? []), { in: at, out: null }];
  return { status: "present", presence: { in: sessions[0].in, out: null, sessions, minutes: day?.presence?.minutes ?? 0 } };
}

// İşi bitirdim: açıq seans bağlanır, günün müddəti artır
export function checkedOut(day: Day | undefined, at: string): Day | undefined {
  const p = day?.presence;
  const last = p?.sessions[p.sessions.length - 1];
  if (!day || !p || !last || last.out) return day;
  const sessions = [...p.sessions.slice(0, -1), { ...last, out: at }];
  return { ...day, presence: { ...p, out: at, sessions, minutes: p.minutes + mins(last.in, at) } };
}
