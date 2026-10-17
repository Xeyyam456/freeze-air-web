"use client";

import { useEffect, useState } from "react";
import { ClipboardList, MapPin } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeList";
import { WorkLogModal } from "@/components/work/WorkLogModal";
import { createClient } from "@/lib/supabase/client";

type LogRow = {
  id: number;
  created_at: string;
  description: string;
  place_text: string | null;
  employees: { full_name: string; photo_url: string | null } | null;
  stores: { name: string; companies: { name: string } | null } | null;
  companies: { name: string } | null;
};

// Yerli tarix "YYYY-MM-DD"; offset gün qədər irəli/geri (dünən: -1)
function dayIso(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "14:32" (Bakı vaxtı)
function timeOf(iso: string) {
  return new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

// İş yeri: mağaza/filial (şirkətin adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer
function placeOf(l: LogRow) {
  if (l.stores) return `${l.stores.companies?.name ?? ""} · ${l.stores.name}`;
  if (l.companies) return l.companies.name;
  return l.place_text ?? "—";
}

async function fetchDay(day: string): Promise<LogRow[]> {
  const { data } = await createClient()
    .from("work_logs")
    .select("id, created_at, description, place_text, employees(full_name, photo_url), stores(name, companies(name)), companies(name)")
    .eq("work_date", day)
    .order("created_at", { ascending: false });
  return (data ?? []) as LogRow[];
}

// Görülən işlər: seçilmiş günün bütün ustalar üzrə işləri. Standart bu gün; dünən və köhnə günləri təqvimlə seçmək olur.
export function WorkHistory() {
  const [day, setDay] = useState(() => dayIso());
  const [logs, setLogs] = useState<LogRow[] | null>(null);
  const [openLog, setOpenLog] = useState<number | null>(null);
  const today = dayIso();
  const yesterday = dayIso(-1);

  useEffect(() => {
    let cancelled = false;
    fetchDay(day).then((list) => {
      if (!cancelled) setLogs(list);
    });
    return () => {
      cancelled = true; // gün tez-tez dəyişəndə köhnə cavab yenisinin üstünə yazılmasın
    };
  }, [day]);

  function changeDay(value: string) {
    if (!value || value > today || value === day) return;
    setLogs(null); // yeni gün yüklənənə qədər "Yüklənir..."
    setDay(value);
  }

  const chip = (active: boolean) =>
    `h-9 rounded-lg px-3 text-[13px] font-semibold transition-colors ${active ? "bg-primary text-white" : "bg-bg text-ink hover:bg-primary-soft"}`;

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
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => changeDay(today)} className={chip(day === today)}>Bu gün</button>
          <button type="button" onClick={() => changeDay(yesterday)} className={chip(day === yesterday)}>Dünən</button>
          <div className="w-44"><DatePicker value={day} onChange={changeDay} max={today} small /></div>
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
          {logs.map((l) => (
            <li key={l.id}>
              <button type="button" onClick={() => setOpenLog(l.id)}
                className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-bg">
              <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-10 !w-10 shrink-0 !text-xs" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 text-sm">
                  <span className="font-semibold">{l.employees?.full_name ?? "—"}</span>
                  <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-primary"><MapPin size={12} className="shrink-0" /> <span className="truncate">{placeOf(l)}</span></span>
                </p>
                <p className="muted mt-0.5 text-sm">{l.description}</p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums">{timeOf(l.created_at)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
