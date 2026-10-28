"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarOff, Send, Trash2, X } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { Modal } from "@/shared/components/Modal";
import { leaveRange, leaveWorkdays, todayBaku, type Leave } from "@/lib/attendance";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

const STATUS = {
  pending: { text: "Gözləyir", cls: "bg-primary-soft text-primary" },
  approved: { text: "Təsdiqləndi", cls: "bg-ok-soft text-ok" },
  rejected: { text: "Rədd edildi", cls: "bg-danger-soft text-danger" },
  cancelled: { text: "Ləğv etdin", cls: "bg-bg text-muted" },
} as const;

// İcazə istə: tarix (bir gün və ya aralıq) + səbəb; admin/rəhbərlik təsdiqləyir (admin paneldə "İcazələr").
// Altda son sorğularım və vəziyyəti; gözləyən sorğunu geri götürmək olur. Bazar günü iş günü deyil, saya düşmür.
export function LeaveModal({ employeeId, onClose }: { employeeId: number; onClose: () => void }) {
  const today = todayBaku();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [mine, setMine] = useState<Leave[] | null>(null);

  const load = useCallback(() => createClient().from("leave_requests").select("id, employee_id, date_from, date_to, reason, status, created_at")
    .eq("employee_id", employeeId).order("date_from", { ascending: false }).limit(6)
    .then((r) => setMine(r.data ?? [])), [employeeId]);
  useEffect(() => { void load(); }, [load]);

  const end = to < from ? from : to;
  const days = leaveWorkdays({ date_from: from, date_to: end });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (days === 0) return toast.error("Seçilən günlər bazardır: iş günü deyil.");
    setPending(true);
    const { error } = await createClient().from("leave_requests").insert({ employee_id: employeeId, date_from: from, date_to: end, reason });
    setPending(false);
    if (error) return toast.error(error.message);
    toast.success("İcazə sorğusu göndərildi", "Admin təsdiqləyəndə xəbər tutacaqsan");
    setReason("");
    void load();
  }

  // Təsdiqlənmiş icazəyə ehtiyac qalmadı: ləğv (başlayıbsa keçmiş günlər icazəli qalır, bazada leave_cancel)
  async function giveUp(l: Leave) {
    const { error } = await createClient().rpc("leave_cancel", { p_id: l.id });
    if (error) return toast.error(error.message);
    toast.success("İcazə ləğv edildi", "İşə gələ bilərsən");
    void load();
  }

  async function cancel(l: Leave) {
    const { error } = await createClient().from("leave_requests").delete().eq("id", l.id);
    if (error) return toast.error(error.message);
    toast.success("Sorğu geri götürüldü");
    void load();
  }

  return (
    <Modal onClose={onClose} labelledBy="leave-title" className="!max-w-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 id="leave-title" className="flex items-center gap-2 text-lg font-bold"><CalendarOff size={18} className="text-primary" /> İcazə istə</h2>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {/* Dar ekranda (< 440) iki tarix alt-alta, ad solda: yan-yana "24 oktyabr 2026" kəsilirdi */}
        <div className="grid grid-cols-2 gap-2 max-[440px]:grid-cols-1">
          <div className="max-[440px]:flex max-[440px]:items-center max-[440px]:gap-2">
            <span className="label max-[440px]:!mb-0 max-[440px]:w-[72px] max-[440px]:shrink-0">Başlayır</span>
            <div className="min-w-0 flex-1"><DatePicker value={from} onChange={(v) => { if (!v) return; setFrom(v); if (to < v) setTo(v); }} /></div>
          </div>
          <div className="max-[440px]:flex max-[440px]:items-center max-[440px]:gap-2">
            <span className="label max-[440px]:!mb-0 max-[440px]:w-[72px] max-[440px]:shrink-0">Bitir</span>
            <div className="min-w-0 flex-1"><DatePicker value={end} onChange={(v) => v && setTo(v)} /></div>
          </div>
        </div>
        <p className="muted text-xs">{days} iş günü (bazar günləri sayılmır)</p>
        <label className="block">
          <span className="label">Səbəb <span className="muted font-normal">(istəyə görə)</span></span>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="field resize-none" placeholder="Məs. ailə işi, xəstəlik" />
        </label>
        <button type="submit" disabled={pending} className="btn btn-primary w-full max-sm:!h-9 max-sm:!text-[13px]"><Send size={16} /> {pending ? "..." : "Sorğunu göndər"}</button>
      </form>

      <div className="mt-5">
        <span className="label">Son sorğularım</span>
        {mine === null ? (
          <p className="muted text-sm">Yüklənir...</p>
        ) : mine.length === 0 ? (
          <p className="muted rounded-xl border border-dashed border-line p-3 text-center text-sm">Hələ icazə istəməmisən.</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {mine.map((l) => {
              const st = STATUS[l.status as keyof typeof STATUS] ?? STATUS.pending;
              return (
                <li key={l.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">{leaveRange(l)}</span>
                    <span className="muted"> · {leaveWorkdays(l)} gün</span>
                    {l.reason && <span className="muted block truncate text-xs">{l.reason}</span>}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>{st.text}</span>
                  {l.status === "approved" && l.date_to >= today && (
                    <button type="button" onClick={() => giveUp(l)} className="btn btn-soft btn-sm !h-7 shrink-0 !px-2 text-xs" title="İcazəni ləğv et, işə gəl">
                      Ehtiyac qalmadı
                    </button>
                  )}
                  {l.status === "pending" && (
                    <button type="button" onClick={() => cancel(l)} className="icon-btn icon-btn-danger !h-7 !w-7" title="Sorğunu geri götür" aria-label="Sorğunu geri götür">
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
