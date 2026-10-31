"use client";

import type { MyLeavesProps } from "@/types/leaves";
import { useMyLeaves } from "../../hooks/useMyLeaves";
import { useMyLeaveActions } from "../../queries/useMyLeaveActions";
import { ActiveLeaves } from "../ActiveLeaves";
import { LeaveHistory } from "../LeaveHistory";
import { LeavesHero } from "../LeavesHero";
import { Card } from "@/shared/components/Card";

// İcazələrim: xülasə + "İcazə istə" (qlobal LeaveModal), aktiv və gözləyən sorğular, aylara görə tarixçə (statusla süzgəc). Realtime.
export function MyLeaves({ employeeId }: MyLeavesProps) {
  const m = useMyLeaves(employeeId);
  const { giveUp, cancel } = useMyLeaveActions();

  if (!employeeId) {
    return <Card className="muted py-12 text-center text-sm">İcazə yalnız usta kartı olan hesabla istənilir.</Card>;
  }

  return (
    <div className="space-y-6">
      <LeavesHero stats={m.stats} />
      {m.rows === null ? (
        <Card className="muted py-12 text-center text-sm">Yüklənir...</Card>
      ) : (
        <>
          <ActiveLeaves items={m.active} today={m.today} onGiveUp={giveUp} onCancel={cancel} />
          <LeaveHistory filter={m.filter} counts={m.counts} total={m.total} byMonth={m.byMonth} today={m.today} onFilter={m.setFilter} />
        </>
      )}
    </div>
  );
}
