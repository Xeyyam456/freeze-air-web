import { leaveWorkdays } from "@/shared/utils/attendance/leaveWorkdays";
import { monthDays } from "@/shared/utils/monthDays";
import type { MyLeaveRow, MyLeavesStats } from "@/types/leaves";

// İlin/ayın icazə günləri: aralığın həmin dövrə düşən iş günləri (prefix: "YYYY" və ya "YYYY-MM")
function daysIn(approved: MyLeaveRow[], prefix: string) {
  const yearly = prefix.length === 4;
  // Dövrün son günü: il → 12-31, ay → ayın real son günü ("-31" noyabrda 1 dekabra çevrilirdi)
  const last = yearly ? `${prefix}-12-31` : monthDays(prefix).at(-1)!;
  return approved.reduce((n, l) => {
    const from = l.date_from.startsWith(prefix) ? l.date_from : l.date_from < prefix ? `${prefix}${yearly ? "-01-01" : "-01"}` : null;
    const to = l.date_to.startsWith(prefix) ? l.date_to : l.date_to > prefix ? last : null;
    return from && to && from <= to ? n + leaveWorkdays({ date_from: from, date_to: to }) : n;
  }, 0);
}

// Xülasə: bu il, bu ay, gözləyən, növbəti təsdiqli (hələ başlamamış) icazə
export function leaveStats(all: MyLeaveRow[], today: string): MyLeavesStats {
  const approved = all.filter((l) => l.status === "approved");
  return {
    year: daysIn(approved, today.slice(0, 4)),
    month: daysIn(approved, today.slice(0, 7)),
    pending: all.filter((l) => l.status === "pending").length,
    next: approved.filter((l) => l.date_from > today).sort((a, b) => a.date_from.localeCompare(b.date_from))[0] ?? null,
  };
}
