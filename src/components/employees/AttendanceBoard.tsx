"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, CalendarX, ChevronLeft, ChevronRight, FileSpreadsheet, Search, Undo2, X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { exportAttendanceAll, exportAttendanceEmployee } from "@/lib/export-attendance";
import { MONTHS_AZ, presenceText, shiftMonth, timeBaku, todayBaku, useMonthAttendance, type MonthAttendance } from "@/lib/attendance";
import { initials } from "@/lib/experience";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { AttendanceCalendar } from "./AttendanceCalendar";

type Emp = { id: number; full_name: string; photo_url: string | null; specialty: string | null };

const norm = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");

const durShort = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} saat ${m % 60} dəq` : `${Math.max(1, m)} dəq`);

// Bu günün vəziyyət həbi (yalnız cari ayda). Bir neçə seans (yenidən işə çıxıb) olanda həb qısadır, seanslar nömrəli siyahıdadır (SessionList)
function todayBadge(a: MonthAttendance) {
  const p = a.today.presence;
  const multi = !!p && p.sessions.length > 1;
  switch (a.today.status) {
    case "present": return p?.out
      ? { text: `İşi bitirib · ${multi ? `${p.sessions.length} seans` : presenceText(p)}`, cls: "bg-bg text-ink" }
      : { text: `İşdədir · ${p ? (multi ? `${timeBaku(p.sessions[p.sessions.length - 1].in)}-dən` : presenceText(p)) : ""}`, cls: "bg-ok-soft text-ok" };
    case "leave": return { text: "İcazəlidir", cls: "bg-violet-50 text-violet-700" };
    case "off": return { text: "Bazar: istirahət", cls: "bg-slate-200 text-slate-600" };
    case "absent": return { text: "İşdə olmayıb", cls: "bg-danger text-white" };
    default: return { text: "Hələ gəlməyib", cls: "bg-bg text-muted" };
  }
}

// Bugünkü seanslar: hər biri ayrıca sətir, nömrə ilə (yalnız bir gündə 2+ seans olanda); MyDay-dəki siyahı ilə eyni üslub
function SessionList({ a }: { a: NonNullable<ReturnType<NonNullable<ReturnType<typeof useMonthAttendance>>["byEmployee"]["get"]>> }) {
  const p = a.today.presence;
  if (!p || p.sessions.length < 2) return null;
  const mins = (x: string, y: string) => Math.max(0, Math.round((new Date(y).getTime() - new Date(x).getTime()) / 60000));
  return (
    <ol className="divide-y divide-line rounded-xl border border-line text-left">
      {p.sessions.map((x, i) => (
        <li key={x.in} className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px]">
          <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${x.out ? "bg-bg text-muted" : "bg-ok text-white"}`}>{i + 1}</span>
          <span className="whitespace-nowrap font-semibold tabular-nums">{timeBaku(x.in)} – {x.out ? timeBaku(x.out) : "…"}</span>
          <span className={`ml-auto whitespace-nowrap pl-2 text-xs font-semibold tabular-nums ${x.out ? "text-muted" : "text-ok"}`}>{x.out ? durShort(mins(x.in, x.out)) : "indi işdə"}</span>
        </li>
      ))}
    </ol>
  );
}

// Davamiyyət bölməsi (usta panelində /davamiyyet, admin-də /davamiyyet): ay seçimi + bütün ustaların cədvəli
// (iş günü, işdə [+bazar], icazəli, gəlmədi, bu gün). Sətrə klik → ustanın təqvimi və gəlmə/getmə saatları. Realtime ilə.
// Web və admin-də eyni fayl. meId verilsə öz sətrin birinci və "Sən" nişanlı.
// canMark (admin): bu gün gəlməyən ustanı "İşdə olmayıb" qeyd etmək və geri almaq (attendance_absences, 0065)
export function AttendanceBoard({ meId = null, canMark = false }: { meId?: number | null; canMark?: boolean }) {
  const thisMonth = todayBaku().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [emps, setEmps] = useState<Emp[] | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Emp | null>(null);
  const att = useMonthAttendance(month);
  const [busy, setBusy] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false); // Excel pəncərəsi

  async function mark(e: Emp, absent: boolean) {
    setBusy(e.id);
    const supabase = createClient();
    const day = todayBaku();
    const { error } = absent
      ? await supabase.from("attendance_absences").insert({ employee_id: e.id, day })
      : await supabase.from("attendance_absences").delete().eq("employee_id", e.id).eq("day", day);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(absent ? `${e.full_name}: bu gün işdə olmayıb` : `${e.full_name}: qeyd geri alındı`);
  }

  useEffect(() => {
    let cancelled = false;
    createClient().from("employees").select("id, full_name, photo_url, specialty").eq("is_management", false).eq("is_active", true).order("full_name")
      .then((r) => { if (!cancelled) setEmps(r.data ?? []); });
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return (emps ?? [])
      .filter((e) => words.every((w) => norm(`${e.full_name} ${e.specialty}`).includes(w)))
      .sort((a, b) => Number(b.id === meId) - Number(a.id === meId));
  }, [emps, query, meId]);

  // Bu günün vəziyyəti (yalnız cari ay): neçə usta işdədir, işi bitirib, icazəlidir, hələ gəlməyib; gözləyən icazə sorğuları
  const today = useMemo(() => {
    const t = { here: 0, done: 0, leave: 0, missing: 0, absent: 0, pending: 0 };
    for (const e of emps ?? []) {
      const a = att?.byEmployee.get(e.id) ?? att?.empty;
      if (!a) continue;
      t.pending += a.pendingLeave;
      if (a.today.status === "present" && a.today.presence?.out) t.done += 1;
      else if (a.today.status === "present") t.here += 1;
      else if (a.today.status === "leave") t.leave += 1;
      else if (a.today.status === "pending") t.missing += 1;
      else if (a.today.status === "absent") t.absent += 1;
    }
    return t;
  }, [att, emps]);

  const [y, m] = month.split("-").map(Number);
  const isCurrent = month === thisMonth;

  // "Bu gün" xanası: vəziyyət nişanı; admin üçün bu gün gəlməyəni "İşdə olmayıb" qeyd etmək / geri almaq
  function todayCell(e: (typeof rows)[number], a: ReturnType<NonNullable<typeof att>["byEmployee"]["get"]> | null, t: ReturnType<typeof todayBadge> | null) {
    if (t && canMark && (a?.today.status === "pending" || a?.today.status === "absent")) {
      return (
        <span className="inline-flex items-center gap-2" onClick={(ev) => ev.stopPropagation()}>
          <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${t.cls}`}>{t.text}</span>
          {a.today.status === "pending" ? (
            <button type="button" disabled={busy === e.id} onClick={() => mark(e, true)} className="btn btn-soft btn-sm !h-7 !px-2 text-xs text-danger" title="Bu gün işə gəlməyib: gəlmədi sayılsın">
              <CalendarX size={13} /> İşdə olmayıb
            </button>
          ) : (
            <button type="button" disabled={busy === e.id} onClick={() => mark(e, false)} className="btn btn-soft btn-sm !h-7 !px-2 text-xs" title="Qeydi geri al">
              <Undo2 size={13} /> Geri al
            </button>
          )}
        </span>
      );
    }
    return t ? <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${t.cls}`}>{t.text}</span>
      : <span className="muted inline-flex items-center gap-1 text-xs"><CalendarCheck size={13} /> Təqvim</span>;
  }

  return (
    <div className="space-y-4">
      {open && <AttendanceCalendar employeeId={open.id} name={open.full_name} onClose={() => setOpen(null)} />}
      {exporting && emps && <ExportModal month={month} emps={emps} onClose={() => setExporting(false)} />}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 max-sm:flex-1">
          <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} className="icon-btn" aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
          <h2 className="min-w-40 text-center text-lg font-bold max-sm:min-w-0 max-sm:flex-1 max-sm:whitespace-nowrap">{MONTHS_AZ[m - 1]} {y}</h2>
          <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} disabled={isCurrent} className="icon-btn disabled:opacity-30" aria-label="Sonrakı ay"><ChevronRight size={18} /></button>
          {!isCurrent && <button type="button" onClick={() => setMonth(thisMonth)} className="btn btn-soft btn-sm ml-1">Bu ay</button>}
        </div>
        <div className="search min-w-56 flex-1 max-sm:order-last max-sm:min-w-0 max-sm:basis-full max-sm:[&_input]:!h-9 max-sm:[&_input]:!rounded-[10px] max-sm:[&_input]:!pl-9 max-sm:[&_input]:!pr-3 max-sm:[&_input]:!text-sm max-sm:[&_input]:!shadow-none max-sm:[&_svg]:!left-3 max-sm:[&_svg]:!h-4 max-sm:[&_svg]:!w-4">
          <Search size={20} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Usta adı ilə axtar..." aria-label="Usta axtarışı" />
        </div>
        <button type="button" onClick={() => setExporting(true)} disabled={!emps?.length} className="btn btn-soft !h-12 shrink-0 max-sm:!h-9" title="Davamiyyəti Excel fayla çıxar" aria-label="Excel">
          <FileSpreadsheet size={18} className="text-ok" /><span className="max-[400px]:hidden">Excel</span>
        </button>
      </div>

      {isCurrent && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Hazırda|işdə", value: today.here, cls: "text-ok" },
            { label: "İşi|bitirib", value: today.done, cls: "text-ink" },
            { label: "Bu gün|icazəli", value: today.leave, cls: "text-violet-600" },
            { label: "Bu gün hələ|gəlməyib", value: today.missing, cls: "text-ink" },
            { label: "Bu gün işdə|olmayıb", value: today.absent, cls: today.absent ? "text-danger" : "text-ink" },
            { label: "Gözləyən icazə|sorğusu", value: today.pending, cls: "text-primary" },
          ].map((x) => (
            <div key={x.label} className="card !py-3 max-sm:flex max-sm:items-center max-sm:justify-between max-sm:gap-2 max-sm:!px-3 max-sm:!py-1.5">
              {/* Mobildə ad həmişə 2 sətir (| yerində sətir sınır), bütün kartlar eyni hündürlükdə */}
              <p className="muted text-xs font-semibold max-sm:text-[11px] max-sm:leading-[1.15]">{x.label.split("|").map((w, i) => <span key={i} className="max-sm:block">{i ? " " : ""}{w}</span>)}</p>
              <p className={`text-2xl font-extrabold max-sm:text-lg max-sm:leading-none ${x.cls}`}>{att ? x.value : "…"}</p>
            </div>
          ))}
        </div>
      )}

      {/* < 1280: hər usta bir kart; göstəricilər (gün) bir sırada: İşdə, İcazə, İcazəsiz, Bazar (cədvəl dar ekranda yana sürüşürdü, sağ sütunlar görünmürdü) */}
      <div className="flex flex-wrap gap-3 xl:hidden">
        {emps === null ? (
          <p className="card muted w-full py-10 text-center text-sm">Yüklənir...</p>
        ) : rows.length === 0 ? (
          <p className="card muted w-full py-10 text-center text-sm">Usta tapılmadı.</p>
        ) : rows.map((e) => {
          const a = att ? att.byEmployee.get(e.id) ?? att.empty : null;
          const t = a && isCurrent ? todayBadge(a) : null;
          const cells: [string, React.ReactNode, string][] = [
            ["İşdə", a?.present ?? "…", "text-ok"],
            ["İcazə", a?.leaveTimes ? a.leave : "—", "text-violet-600"],
            ["İcazəsiz", a?.absent || "—", a?.absent ? "text-danger" : "text-muted"],
            ["Bazar", a?.extra || "—", "text-slate-600"],
          ];
          return (
            <div key={e.id} role="button" tabIndex={0} onClick={() => setOpen(e)} onKeyDown={(ev) => ev.key === "Enter" && setOpen(e)}
              className={`card grow basis-[320px] cursor-pointer !p-4 max-sm:!p-2.5 transition-colors hover:bg-primary-soft/30 ${e.id === meId ? "ring-2 ring-primary/30" : ""}`}>
              <div className="flex items-center gap-3 max-sm:gap-2">
                {e.photo_url
                  // eslint-disable-next-line @next/next/no-img-element -- storage avatarı
                  ? <img src={e.photo_url} alt={e.full_name} className="h-10 w-10 shrink-0 rounded-full object-cover max-sm:h-8 max-sm:w-8" />
                  : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary max-sm:h-8 max-sm:w-8 max-sm:text-[10px]">{initials(e.full_name)}</span>}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <span className="truncate">{e.full_name}</span>
                    {e.id === meId && <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">Sən</span>}
                  </span>
                  <span className="muted block truncate text-xs">{e.specialty ?? ""}{a ? `${e.specialty ? " · " : ""}${a.workdays} iş günü` : ""}</span>
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5 max-sm:mt-2 max-sm:gap-1">
                {cells.map(([l, v, c]) => (
                  <span key={l} className="min-w-0 rounded-xl bg-bg px-2.5 py-2 text-center max-sm:rounded-lg max-sm:px-1 max-sm:py-1">
                    <span className="muted block whitespace-nowrap text-[11px] font-semibold max-sm:text-[10px] max-sm:leading-tight">{l}</span>
                    <b className={`block text-[15px] tabular-nums max-sm:text-sm max-sm:leading-tight ${v === "—" ? "text-muted" : c}`}>{v}</b>
                  </span>
                ))}
              </div>
              {t && (
                <div className="mt-3 space-y-2 border-t border-line pt-3 max-sm:mt-2 max-sm:pt-2">
                  <div className="flex flex-wrap items-center justify-end gap-2">{todayCell(e, a, t)}</div>
                  {a && <SessionList a={a} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card overflow-x-auto !p-0 max-xl:hidden">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line bg-[#f8f9fc] text-left text-xs font-semibold text-muted">
              <th className="px-4 py-2.5">Usta</th>
              <th className="px-2 py-2.5 text-center" title="Ayın bu günə qədər iş günləri (B.e.–Şənbə)">İş günü</th>
              <th className="px-2 py-2.5 text-center">İşdə olub</th>
              <th className="px-2 py-2.5 text-center">İcazə aldı</th>
              <th className="px-2 py-2.5 text-center" title="İş günü gəlməyib, icazəsi də yoxdur">İcazəsiz qalıb</th>
              <th className="px-2 py-2.5 text-center" title="Ay ərzində işdə olmadığı bütün iş günləri: icazəli + icazəsiz">İşdə olmayıb (cəmi)</th>
              <th className="px-2 py-2.5 text-center">Bazar günü işə çıxıb</th>
              <th className="px-4 py-2.5 text-right">{isCurrent ? "Bu gün" : ""}</th>
            </tr>
          </thead>
          <tbody>
            {emps === null ? (
              <tr><td colSpan={8} className="muted py-10 text-center">Yüklənir...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="muted py-10 text-center">Usta tapılmadı.</td></tr>
            ) : rows.map((e) => {
              const a = att ? att.byEmployee.get(e.id) ?? att.empty : null;
              const t = a && isCurrent ? todayBadge(a) : null;
              return (
                <tr key={e.id} onClick={() => setOpen(e)} className={`cursor-pointer border-b border-line last:border-b-0 transition-colors hover:bg-primary-soft/40 ${e.id === meId ? "bg-primary-soft/30" : ""}`}>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-3">
                      {e.photo_url
                        // eslint-disable-next-line @next/next/no-img-element -- storage avatarı
                        ? <img src={e.photo_url} alt={e.full_name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                        : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">{initials(e.full_name)}</span>}
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-semibold">
                          <span className="truncate">{e.full_name}</span>
                          {e.id === meId && <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-primary">Sən</span>}
                        </span>
                        <span className="muted block truncate text-xs">{e.specialty ?? ""}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center font-semibold tabular-nums">{a?.workdays ?? "…"}</td>
                  <td className="px-2 py-2.5 text-center tabular-nums"><b className="text-ok">{a?.present ?? "…"}</b> <span className="muted text-xs">gün</span></td>
                  <td className="px-2 py-2.5 text-center tabular-nums">
                    {a?.leaveTimes ? <><b className="text-violet-600">{a.leaveTimes}</b> <span className="muted text-xs">dəfə · {a.leave} gün</span></> : <span className="muted">—</span>}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{a?.absent ? <><b className="text-danger">{a.absent}</b> <span className="muted text-xs">gün</span></> : <span className="muted">—</span>}</td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{a && a.leave + a.absent ? <><b className="text-ink">{a.leave + a.absent}</b> <span className="muted text-xs">gün</span></> : <span className="muted">—</span>}</td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{a?.extra ? <><b className="text-slate-600">{a.extra}</b> <span className="muted text-xs">dəfə</span></> : <span className="muted">—</span>}</td>
                  <td className="px-4 py-2.5 text-right">
                    {todayCell(e, a, t)}
                    {t && a && <div className="ml-auto mt-2 w-56"><SessionList a={a} /></div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Excel ixracı: bütün ustalar (Xülasə + Gün-gün) və ya seçilmiş bir usta (gün-gün saatlarla); seçilmiş ay üzrə
function ExportModal({ month, emps, onClose }: { month: string; emps: Emp[]; onClose: () => void }) {
  const [who, setWho] = useState("all");
  const [pending, setPending] = useState(false);
  const [y, m] = month.split("-").map(Number);

  async function run() {
    setPending(true);
    try {
      const emp = emps.find((e) => String(e.id) === who);
      if (emp) await exportAttendanceEmployee(month, emp);
      else await exportAttendanceAll(month, emps);
      onClose();
    } catch {
      toast.error("Excel fayl yaradılmadı.");
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal onClose={onClose} labelledBy="att-export-title" className="!max-w-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="att-export-title" className="flex items-center gap-2 text-lg font-bold"><FileSpreadsheet size={18} className="text-ok" /> Davamiyyəti Excel-ə çıxar</h2>
          <p className="muted text-sm">{MONTHS_AZ[m - 1]} {y}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <label className="block">
        <span className="label">Kimin davamiyyəti</span>
        <select value={who} onChange={(e) => setWho(e.target.value)} className="field cursor-pointer">
          <option value="all">Bütün ustalar (tam siyahı)</option>
          {emps.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
        </select>
      </label>
      <p className="muted mt-2 text-xs">
        {who === "all"
          ? "İki vərəq: Xülasə (hər usta bir sətir) və Gün-gün (✓ işdə, İ icazəli, X gəlmədi, B bazar)."
          : "Ayın hər günü: vəziyyət, gəlmə və getmə saatı, müddət; yuxarıda aylıq xülasə."}
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn btn-soft">Ləğv et</button>
        <button type="button" onClick={run} disabled={pending} className="btn btn-primary"><FileSpreadsheet size={16} /> {pending ? "Hazırlanır..." : "Yüklə"}</button>
      </div>
    </Modal>
  );
}
