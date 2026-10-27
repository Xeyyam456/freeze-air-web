"use client";

import { useEffect, useState } from "react";
import { ClipboardList, MapPin } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeList";
import { WORK_SAVED } from "@/components/work/MyDay";
import { WorkLogModal } from "@/components/work/WorkLogModal";
import { fetchFileCounts, fetchGroupMap, mergeGroupLogs, type FileCount } from "@/lib/jobs";
import { FileBadges } from "./FileBadges";
import { createClient } from "@/lib/supabase/client";

type LogRow = {
  id: number;
  created_at: string;
  description: string;
  place_text: string | null;
  employees: { full_name: string; photo_url: string | null } | null;
  stores: { name: string; companies: { name: string } | null } | null;
  companies: { name: string } | null;
  files?: FileCount;
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

// Qrup işi (bir neçə üzvə eyni tapşırıq) bir sətirdir və bir iş sayılır: "Xəyyam + Fərhad"
async function fetchDay(day: string): Promise<LogRow[]> {
  const supabase = createClient();
  const [{ data }, groups] = await Promise.all([
    supabase
      .from("work_logs")
      .select("id, created_at, description, place_text, employees(full_name, photo_url), stores(name, companies(name)), companies(name)")
      .eq("work_date", day)
      .order("created_at", { ascending: false }),
    fetchGroupMap(supabase, day, day),
  ]);
  const merged = mergeGroupLogs((data ?? []) as LogRow[], groups);
  const files = await fetchFileCounts(supabase, merged.map((l) => l.id)); // ▶ Video / şəkil / akt (qrup üzrə)
  return merged.map((l) => ({ ...l, files: files.get(l.id) }));
}

// Görülən işlər: seçilmiş günün bütün ustalar üzrə işləri. Standart bu gün; dünən və köhnə günləri təqvimlə seçmək olur.
export function WorkHistory() {
  const [day, setDay] = useState(() => dayIso());
  const [logs, setLogs] = useState<LogRow[] | null>(null);
  const [openLog, setOpenLog] = useState<number | null>(null);
  const [tick, setTick] = useState(0); // iş yazılanda (MyDay) artır → siyahı yenidən yüklənir
  const today = dayIso();
  const yesterday = dayIso(-1);

  useEffect(() => {
    const onSaved = () => setTick((t) => t + 1);
    window.addEventListener(WORK_SAVED, onSaved);
    return () => window.removeEventListener(WORK_SAVED, onSaved);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchDay(day).then((list) => {
      if (!cancelled) setLogs(list);
    });
    return () => {
      cancelled = true; // gün tez-tez dəyişəndə köhnə cavab yenisinin üstünə yazılmasın
    };
  }, [day, tick]);

  function changeDay(value: string) {
    if (!value || value > today || value === day) return;
    setLogs(null); // yeni gün yüklənənə qədər "Yüklənir..."
    setDay(value);
  }

  const chip = (active: boolean) =>
    `h-9 shrink-0 whitespace-nowrap rounded-lg px-3 text-[13px] max-[400px]:flex-1 font-semibold transition-colors ${active ? "bg-primary text-white" : "bg-bg text-ink hover:bg-primary-soft"}`;

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
          {logs.map((l) => (
            <li key={l.id}>
              <button type="button" onClick={() => setOpenLog(l.id)}
                className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-bg max-sm:gap-2 max-sm:px-0">
              <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-10 !w-10 shrink-0 !text-xs max-sm:!h-8 max-sm:!w-8 max-sm:!text-[10px]" />
              <div className="@container min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 text-sm">
                  {/* Mobildə ad (qrupda "A + B") həmişə bir sətir: şrift kartın eninə görə kiçilir (ən çox 14px) */}
                  <span className="font-semibold max-sm:basis-full max-sm:whitespace-nowrap max-sm:text-[min(14px,calc(100cqi/var(--n)))]"
                    style={{ "--n": ((l.employees?.full_name ?? "—").length * 0.58).toFixed(1) } as React.CSSProperties}>{l.employees?.full_name ?? "—"}</span>
                  <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-primary"><MapPin size={12} className="shrink-0" /> <span className="truncate">{placeOf(l)}</span></span>
                </p>
                <p className="muted mt-0.5 text-sm">{l.description}</p>
                {/* Mobildə nişanlar mətnin altında (sağda yer yoxdur) */}
                <FileBadges files={l.files} className="mt-1 sm:hidden" />
              </div>
              <FileBadges files={l.files} className="max-sm:hidden" />
              <p className="shrink-0 text-sm font-semibold tabular-nums">{timeOf(l.created_at)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
