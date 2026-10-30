"use client";

import { CalendarOff, X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { LeaveModalProps } from "@/types/leaves";
import { LeaveForm } from "../LeaveForm";
import { RecentRequests } from "../RecentRequests";

// İcazə istə: tarix (bir gün və ya aralıq) + səbəb; admin/rəhbərlik təsdiqləyir (admin paneldə "İcazələr").
// Altda son sorğularım və vəziyyəti; gözləyən sorğunu geri götürmək olur. Bazar günü iş günü deyil, saya düşmür.
export function LeaveModal({ employeeId, onClose }: LeaveModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="leave-title" className="!max-w-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 id="leave-title" className="flex items-center gap-2 text-lg font-bold"><CalendarOff size={18} className="text-primary" /> İcazə istə</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <LeaveForm employeeId={employeeId} />
      <RecentRequests employeeId={employeeId} />
    </Modal>
  );
}
