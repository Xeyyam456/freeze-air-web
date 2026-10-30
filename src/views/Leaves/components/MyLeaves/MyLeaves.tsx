"use client";

import type { MyLeavesProps } from "@/types/leaves";
import { useMyLeaves } from "../../hooks/useMyLeaves";
import { useMyLeaveActions } from "../../queries/useMyLeaveActions";
import { ActiveLeaves } from "../ActiveLeaves";
import { LeaveHistory } from "../LeaveHistory";
import { LeavesHero } from "../LeavesHero";

// İcazələrim: xülasə + "İcazə istə" (qlobal LeaveModal), aktiv və gözləyən sorğular, aylara görə tarixçə (statusla süzgəc). Realtime.
export function MyLeaves({ employeeId }: MyLeavesProps) {
  const m = useMyLeaves(employeeId);
  const { giveUp, cancel } = useMyLeaveActions();

  if (!employeeId) {
    return <div className="card muted py-12 text-center text-sm">İcazə yalnız usta kartı olan hesabla istənilir.</div>;
  }

  return (
    <div className="space-y-6">
      <LeavesHero stats={m.stats} />
      {m.rows === null ? (
        <div className="card muted py-12 text-center text-sm">Yüklənir...</div>
      ) : (
        <>
          <ActiveLeaves items={m.active} today={m.today} onGiveUp={giveUp} onCancel={cancel} />
          <LeaveHistory filter={m.filter} counts={m.counts} total={m.total} byMonth={m.byMonth} today={m.today} onFilter={m.setFilter} />
        </>
      )}
    </div>
  );
}
