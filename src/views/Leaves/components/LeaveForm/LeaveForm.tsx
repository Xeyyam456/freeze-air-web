"use client";

import { Send } from "lucide-react";
import { DatePicker } from "@/shared/components/DatePicker";
import type { LeaveFormProps } from "@/types/leaves";
import { useLeaveForm } from "../../hooks/useLeaveForm";

// Tarix aralığı + səbəb + göndər. Dar ekranda (< 440) iki tarix alt-alta, ad solda: yan-yana "24 oktyabr 2026" kəsilirdi
export function LeaveForm({ employeeId }: LeaveFormProps) {
  const f = useLeaveForm(employeeId);

  return (
    <form onSubmit={f.submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2 max-[440px]:grid-cols-1">
        <div className="max-[440px]:flex max-[440px]:items-center max-[440px]:gap-2">
          <span className="label max-[440px]:!mb-0 max-[440px]:w-[72px] max-[440px]:shrink-0">Başlayır</span>
          <div className="min-w-0 flex-1"><DatePicker value={f.from} onChange={f.changeFrom} /></div>
        </div>
        <div className="max-[440px]:flex max-[440px]:items-center max-[440px]:gap-2">
          <span className="label max-[440px]:!mb-0 max-[440px]:w-[72px] max-[440px]:shrink-0">Bitir</span>
          <div className="min-w-0 flex-1"><DatePicker value={f.end} onChange={(v) => v && f.setTo(v)} /></div>
        </div>
      </div>
      <p className="muted text-xs">{f.days} iş günü (bazar günləri sayılmır)</p>
      <label className="block">
        <span className="label">Səbəb <span className="muted font-normal">(istəyə görə)</span></span>
        <textarea value={f.reason} onChange={(e) => f.setReason(e.target.value)} rows={2} className="field resize-none" placeholder="Məs. ailə işi, xəstəlik" />
      </label>
      <button type="submit" disabled={f.pending} className="btn btn-primary w-full max-sm:!h-9 max-sm:!text-[13px]"><Send size={16} /> {f.pending ? "..." : "Sorğunu göndər"}</button>
    </form>
  );
}
