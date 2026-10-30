"use client";

import { useData } from "@/lib/useData";
import { fetchRecentLeaves } from "@/services/leaves/fetchRecentLeaves";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { RecentRequestsProps } from "@/types/leaves";
import { RECENT_LEAVES_KEY } from "../../queries/keys";
import { useMyLeaveActions } from "../../queries/useMyLeaveActions";
import { RecentRow } from "../RecentRow";

// Son sorğularım (6) və vəziyyəti
export function RecentRequests({ employeeId }: RecentRequestsProps) {
  const mine = useData(RECENT_LEAVES_KEY, () => fetchRecentLeaves(employeeId), [employeeId]);
  const { giveUp, cancel } = useMyLeaveActions();
  const today = todayBaku();

  return (
    <div className="mt-5">
      <span className="label">Son sorğularım</span>
      {mine === null ? (
        <p className="muted text-sm">Yüklənir...</p>
      ) : mine.length === 0 ? (
        <p className="muted rounded-xl border border-dashed border-line p-3 text-center text-sm">Hələ icazə istəməmisən.</p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {mine.map((l) => <RecentRow key={l.id} leave={l} today={today} onGiveUp={giveUp} onCancel={cancel} />)}
        </ul>
      )}
    </div>
  );
}
