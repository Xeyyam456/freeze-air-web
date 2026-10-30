"use client";

import { CalendarClock } from "lucide-react";
import type { ActiveLeavesProps } from "@/types/leaves";
import { LeaveCard } from "../LeaveCard";

// Aktiv və gözləyən sorğular: təsdiqlənmişdə "Ehtiyac qalmadı", gözləyəndə "Geri götür"
export function ActiveLeaves({ items, today, onGiveUp, onCancel }: ActiveLeavesProps) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold"><CalendarClock size={18} className="text-primary" /> Aktiv və gözləyən</h2>
      {items.length === 0 ? (
        <p className="card muted py-8 text-center text-sm">İndi aktiv və ya gözləyən icazən yoxdur.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((l) => (
            <LeaveCard key={l.id} leave={l} today={today}
              onGiveUp={l.status === "approved" ? () => onGiveUp(l.id) : undefined}
              onCancel={l.status === "pending" ? () => onCancel(l.id) : undefined} />
          ))}
        </ul>
      )}
    </section>
  );
}
