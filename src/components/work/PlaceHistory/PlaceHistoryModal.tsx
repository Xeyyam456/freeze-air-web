"use client";

import { useMemo, useState } from "react";
import { History, Search, X } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import { useData } from "@/lib/useData";
import { fetchPlaceHistory, HISTORY_LIMIT } from "@/services/myWork/placeHistory";
import { Modal } from "@/shared/components/Modal";
import { norm } from "@/shared/utils/norm";
import type { HistoryRow, PlaceHistoryModalProps } from "@/types/myWork";
import { WorkLogModal } from "../WorkLogModal";
import { HistoryItem } from "./HistoryItem";

// Obyektin iş tarixçəsi: usta obyektə getməzdən əvvəl orada kim, nə vaxt, nə edib görür. Günlərə görə qruplu, axtarışlı;
// sətrə klik → işin ətraflı pəncərəsi (akt, şəkillər)
export function PlaceHistoryModal({ target, onClose }: PlaceHistoryModalProps) {
  // Keşdə: eyni mağazanın tarixçəsini təkrar açanda dərhal görünür
  const rows = useData("place-history", () => fetchPlaceHistory(target), [target.storeId ?? null, target.companyId ?? null]);
  const [query, setQuery] = useState("");
  const [openLog, setOpenLog] = useState<number | null>(null);
  const showStore = !target.storeId; // şirkətin tarixçəsində hansı filial olduğu da yazılır

  const days = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    const list = (rows ?? []).filter((r) => {
      const hay = norm(`${r.employees?.full_name ?? ""} ${r.description} ${r.stores?.code ?? ""} ${r.stores?.name ?? ""}`);
      return words.every((w) => hay.includes(w));
    });
    const map = new Map<string, HistoryRow[]>();
    for (const r of list) map.set(r.work_date, [...(map.get(r.work_date) ?? []), r]);
    return [...map.entries()];
  }, [rows, query]);

  return (
    <>
      {openLog && <WorkLogModal key={openLog} logId={openLog} onClose={() => setOpenLog(null)} />}
      <Modal onClose={onClose} labelledBy="place-history-title" className="flex max-h-[85vh] !max-w-2xl flex-col">
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="place-history-title" className="flex items-center gap-2 text-lg font-bold">
              <History size={18} className="shrink-0 text-primary" /> İş tarixçəsi
            </h2>
            <p className="muted truncate text-sm">{target.title}{rows && rows.length > 0 && ` · ${rows.length} iş`}</p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
        </div>

        {rows && rows.length > 0 && (
          <div className="search mb-3 shrink-0">
            <Search size={20} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Usta, görülən iş və ya filial ilə axtar..." aria-label="Tarixçədə axtar" />
          </div>
        )}

        {rows === null ? (
          <p className="muted grid min-h-[240px] place-items-center text-sm">Yüklənir...</p>
        ) : rows.length === 0 ? (
          <div className="grid min-h-[240px] place-items-center rounded-xl border border-dashed border-line text-center">
            <div>
              <span className="icon-tile mx-auto"><History size={20} /></span>
              <p className="mt-3 font-semibold">Burada hələ iş görülməyib</p>
              <p className="muted text-sm">İş qeydi yazılan kimi burada görünəcək.</p>
            </div>
          </div>
        ) : days.length === 0 ? (
          <p className="muted py-10 text-center text-sm">Bu axtarışa uyğun iş tapılmadı.</p>
        ) : (
          <div className="nice-scroll -mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
            {days.map(([day, items]) => (
              <section key={day}>
                <h3 className="sticky top-0 z-10 bg-surface py-1.5 text-xs font-bold uppercase tracking-wide text-muted">{formatDateAz(day)} · {items.length} iş</h3>
                <ul className="divide-y divide-line">
                  {items.map((r) => <HistoryItem key={r.id} r={r} showStore={showStore} onOpen={setOpenLog} />)}
                </ul>
              </section>
            ))}
            {rows.length >= HISTORY_LIMIT && <p className="muted py-3 text-center text-xs">Son {HISTORY_LIMIT} iş göstərilir.</p>}
          </div>
        )}
      </Modal>
    </>
  );
}
