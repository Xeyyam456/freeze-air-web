"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { DatePicker } from "@/shared/components/DatePicker";
import { useData } from "@/lib/useData";
import { fetchDayLogs } from "@/services/myWork/workHistory";
import { dayIso } from "../time";
import { WorkLogModal } from "../WorkLogModal";
import { DayLogRow } from "./components/DayLogRow";

const chip = (active: boolean) =>
  `h-9 shrink-0 whitespace-nowrap rounded-lg px-3 text-[13px] max-[400px]:flex-1 font-semibold transition-colors ${active ? "bg-primary text-white" : "bg-bg text-ink hover:bg-primary-soft"}`;

// Görülən işlər: seçilmiş günün bütün ustalar üzrə işləri. Standart bu gün; dünən və köhnə günləri təqvimlə seçmək olur.
export function WorkHistory() {
  const [day, setDay] = useState(() => dayIso());
  // Keşdə: iş yazılanda / tapşırıq dəyişəndə QueryProvider "work-history"-ni yeniləyir; Panelə qayıdanda dərhal görünür
  const logs = useData("work-history", () => fetchDayLogs(day), [day]);
  const [openLog, setOpenLog] = useState<number | null>(null);
  const today = dayIso();
  const yesterday = dayIso(-1);

  function changeDay(value: string) {
    if (!value || value > today || value === day) return;
    setDay(value); // yeni gün gələnə qədər köhnə günün siyahısı qalır
  }

  const emptyText = day === today ? "Bu gün hələ iş qeydi yoxdur." : day === yesterday ? "Dünən iş qeydi olmayıb." : "Bu gün iş qeydi olmayıb.";

  return (
    <>
      {/* Sətrə klik → işin ətraflı pəncərəsi (admin paneldəki kimi) */}
      {openLog && <WorkLogModal key={openLog} logId={openLog} onClose={() => setOpenLog(null)} />}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="card-title flex items-center gap-2">
          <ClipboardList size={18} className="text-primary" /> Görülən işlər
          {logs && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{logs.length}</span>}
        </h2>
        <div className="flex items-center gap-1.5 max-sm:w-full max-[400px]:flex-wrap">
          <button type="button" onClick={() => changeDay(today)} className={chip(day === today)}>Bu gün</button>
          <button type="button" onClick={() => changeDay(yesterday)} className={chip(day === yesterday)}>Dünən</button>
          <div className="w-44 max-sm:min-w-0 max-sm:flex-1 max-[400px]:!basis-full"><DatePicker value={day} onChange={changeDay} max={today} small /></div>
        </div>
      </div>

      {logs === null ? (
        <p className="muted text-sm">Yüklənir...</p>
      ) : logs.length === 0 ? (
        <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-line text-center">
          <p className="muted text-sm">{emptyText}</p>
        </div>
      ) : (
        <ul className="nice-scroll -mr-2 min-h-0 flex-1 divide-y divide-line overflow-y-auto pr-2">
          {logs.map((l) => <DayLogRow key={l.id} l={l} onOpen={setOpenLog} />)}
        </ul>
      )}
    </>
  );
}
