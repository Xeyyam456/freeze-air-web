"use client";

import { useEffect, useMemo, useState } from "react";
import { History, MapPin, Paperclip, Search, X } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeList";
import { Modal } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { WorkLogModal } from "./WorkLogModal";

// Neçə iş göstərilir (ən yenilər); obyektdə bundan çox iş olanda altda qeyd çıxır
const LIMIT = 150;

type Row = {
  id: number;
  work_date: string;
  created_at: string;
  description: string;
  employees: { full_name: string; photo_url: string | null } | null;
  stores: { code: string; name: string } | null;
  work_files: { id: number }[];
};

// Tarixçə hədəfi: bir mağaza/filial və ya bütün şirkət/market (özü + bütün filialları/mağazaları)
export type HistoryTarget = { title: string; storeId?: number; companyId?: number };

const SELECT = "id, work_date, created_at, description, employees(full_name, photo_url), stores(code, name), work_files(id)";

async function fetchHistory(t: HistoryTarget): Promise<Row[]> {
  const supabase = createClient();
  const newest = <Q extends { order: (c: string, o: { ascending: boolean }) => Q }>(q: Q) =>
    q.order("work_date", { ascending: false }).order("created_at", { ascending: false });
  if (t.storeId) {
    const { data } = await newest(supabase.from("work_logs").select(SELECT).eq("store_id", t.storeId)).limit(LIMIT);
    return (data ?? []) as Row[];
  }
  // Şirkət: sabit məkanın özündə görülənlər + filiallarında görülənlər (iki sorğu, sonra tarixə görə birləşir)
  const [own, branches] = await Promise.all([
    newest(supabase.from("work_logs").select(SELECT).eq("company_id", t.companyId!)).limit(LIMIT),
    newest(supabase.from("work_logs").select(`${SELECT}, s:stores!inner(company_id)`).eq("s.company_id", t.companyId!)).limit(LIMIT),
  ]);
  return [...((own.data ?? []) as Row[]), ...((branches.data ?? []) as Row[])]
    .sort((a, b) => b.work_date.localeCompare(a.work_date) || b.created_at.localeCompare(a.created_at))
    .slice(0, LIMIT);
}

// "14:32" (Bakı vaxtı)
function timeOf(iso: string) {
  return new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

function norm(s: string) {
  return s.toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

// Obyektin iş tarixçəsi: usta obyektə getməzdən əvvəl orada kim, nə vaxt, nə edib görür. Günlərə görə qruplu, axtarışlı;
// sətrə klik → işin ətraflı pəncərəsi (akt, şəkillər)
export function PlaceHistoryModal({ target, onClose }: { target: HistoryTarget; onClose: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [query, setQuery] = useState("");
  const [openLog, setOpenLog] = useState<number | null>(null);
  const showStore = !target.storeId; // şirkətin tarixçəsində hansı filial olduğu da yazılır

  useEffect(() => {
    let cancelled = false;
    fetchHistory(target).then((r) => { if (!cancelled) setRows(r); });
    return () => { cancelled = true; };
  }, [target]);

  const days = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    const list = (rows ?? []).filter((r) => {
      const hay = norm(`${r.employees?.full_name ?? ""} ${r.description} ${r.stores?.code ?? ""} ${r.stores?.name ?? ""}`);
      return words.every((w) => hay.includes(w));
    });
    const map = new Map<string, Row[]>();
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
            <p className="muted truncate text-sm">
              {target.title}{rows && rows.length > 0 && ` · ${rows.length} iş`}
            </p>
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
                <h3 className="sticky top-0 z-10 bg-surface py-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                  {formatDateAz(day)} · {items.length} iş
                </h3>
                <ul className="divide-y divide-line">
                  {items.map((r) => (
                    <li key={r.id}>
                      <button type="button" onClick={() => setOpenLog(r.id)}
                        className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-bg">
                        <Avatar employee={{ full_name: r.employees?.full_name ?? "?", photo_url: r.employees?.photo_url ?? null }} className="!h-10 !w-10 shrink-0 !text-xs" />
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-2 text-sm">
                            <span className="font-semibold">{r.employees?.full_name ?? "—"}</span>
                            {showStore && r.stores && (
                              <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-primary">
                                <MapPin size={12} className="shrink-0" /> <span className="truncate">{r.stores.code} {r.stores.name}</span>
                              </span>
                            )}
                          </p>
                          <p className="muted mt-0.5 line-clamp-2 text-sm">{r.description}</p>
                        </div>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-sm font-semibold tabular-nums">{timeOf(r.created_at)}</span>
                          {r.work_files.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-xs text-muted" title="Akt və şəkillər"><Paperclip size={12} />{r.work_files.length}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {rows.length >= LIMIT && <p className="muted py-3 text-center text-xs">Son {LIMIT} iş göstərilir.</p>}
          </div>
        )}
      </Modal>
    </>
  );
}

// Düymə + pəncərə (server komponentlərindən, məs. şirkətin vizit kartından işlətmək üçün)
export function PlaceHistoryButton({ target, className = "btn btn-soft btn-sm" }: { target: HistoryTarget; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <History size={14} /> İş tarixçəsi
      </button>
      {open && <PlaceHistoryModal target={target} onClose={() => setOpen(false)} />}
    </>
  );
}
