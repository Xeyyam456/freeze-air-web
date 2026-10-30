import { presenceText } from "@/shared/utils/attendance/presenceText";
import { timeBaku } from "@/shared/utils/timeBaku";
import type { MonthAttendance, TodayBadge } from "@/types/attendance";

// Bu günün vəziyyət həbi (yalnız cari ayda). Bir neçə seans (yenidən işə çıxıb) olanda həb qısadır, seanslar nömrəli siyahıdadır (TodaySessions)
export function todayBadge(a: MonthAttendance): TodayBadge {
  const p = a.today.presence;
  const multi = !!p && p.sessions.length > 1;
  switch (a.today.status) {
    case "present": return p?.out
      ? { text: `İşi bitirib · ${multi ? `${p.sessions.length} seans` : presenceText(p)}`, cls: "bg-bg text-ink" }
      : { text: `İşdədir · ${p ? (multi ? `${timeBaku(p.sessions[p.sessions.length - 1].in)}-dən` : presenceText(p)) : ""}`, cls: "bg-ok-soft text-ok" };
    case "leave": return { text: "İcazəlidir", cls: "bg-violet-50 text-violet-700" };
    case "off": return { text: "Bazar: istirahət", cls: "bg-slate-200 text-slate-600" };
    case "absent": return { text: "İşdə olmayıb", cls: "bg-danger text-white" };
    default: return { text: "Hələ gəlməyib", cls: "bg-bg text-muted" };
  }
}
