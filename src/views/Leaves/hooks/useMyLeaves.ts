import { useMemo, useState } from "react";
import { useData } from "@/lib/useData";
import { fetchMyLeaves } from "@/services/leaves/fetchMyLeaves";
import { useAttendanceLive } from "@/shared/hooks/useAttendanceLive";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { LeaveFilter } from "@/types/leaves";
import { MY_LEAVES_KEY } from "../queries/keys";
import { groupByMonth } from "../utils/groupByMonth";
import { leaveStats } from "../utils/leaveStats";
import { splitLeaves } from "../utils/splitLeaves";

const FILTERS: LeaveFilter[] = ["all", "approved", "rejected", "cancelled"];

// İcazələrim: sorğular (keşdə + canlı), aktiv/tarixçə, xülasə, tarixçə süzgəci və aylara görə qruplar
export function useMyLeaves(employeeId: number | null) {
  const today = todayBaku();
  useAttendanceLive();
  const rows = useData(MY_LEAVES_KEY, async () => (employeeId ? fetchMyLeaves(employeeId) : []), [employeeId]);
  const [filter, setFilter] = useState<LeaveFilter>("all");

  const { active, past, stats } = useMemo(() => {
    const all = rows ?? [];
    return { ...splitLeaves(all, today), stats: leaveStats(all, today) };
  }, [rows, today]);

  const counts = Object.fromEntries(FILTERS.map((f) => [f, f === "all" ? past.length : past.filter((l) => l.status === f).length])) as Record<LeaveFilter, number>;
  const shown = filter === "all" ? past : past.filter((l) => l.status === filter);

  return { today, rows, active, stats, filter, setFilter, counts, total: past.length, byMonth: groupByMonth(shown) };
}
