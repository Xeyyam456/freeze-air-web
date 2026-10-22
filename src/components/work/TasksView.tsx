"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, Check, ChevronLeft, ChevronRight, ListChecks, MapPin, Paperclip, PenLine, Store, Undo2, Users } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeList";
import { createClient } from "@/lib/supabase/client";
import { TASKS_CHANGED } from "@/lib/tasks-live";
import { toast } from "@/lib/toast";
import { TaskNoteModal } from "./TaskNoteModal";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function shift(day: string, delta: number) {
  const d = new Date(`${day}T00:00`);
  d.setDate(d.getDate() + delta);
  return iso(d);
}
// Həftə bazar ertəsindən başlayır
function weekStart(day: string) {
  const d = new Date(`${day}T00:00`);
  return shift(day, -((d.getDay() + 6) % 7));
}
const WEEKDAYS = ["B.e.", "Ç.a.", "Çər.", "C.a.", "Cüm.", "Şən.", "Baz."];
const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];

async function fetchTasks(day: string) {
  const supabase = createClient();
  const [tasks, employees] = await Promise.all([
    supabase.from("tasks")
      .select("id, employee_id, reason, done, note, work_log_id, place_text, cancelled_at, reassigned_to, stores(name, code, companies(name)), companies(name), work_logs(description, work_files(id, kind))")
      .eq("task_date", day).order("created_at").then((r) => r.data ?? []),
    supabase.from("employees").select("id, full_name, photo_url").eq("is_management", false).eq("is_active", true).order("full_name").then((r) => r.data ?? []),
  ]);
  // Geri alınıb başqasına verilənlər: yeni tapşırıq kimdədir ("Geri alınıb → Ad"; admin paneldəki ilə eyni)
  const nextIds = tasks.flatMap((t) => (t.reassigned_to ? [t.reassigned_to] : []));
  const nextName = new Map<number, string>();
  if (nextIds.length) {
    const { data } = await supabase.from("tasks").select("id, employees(full_name)").in("id", nextIds);
    for (const n of data ?? []) if (n.employees) nextName.set(n.id, n.employees.full_name);
  }
  return { tasks: tasks.map((t) => ({ ...t, nextName: t.reassigned_to ? nextName.get(t.reassigned_to) : undefined })), employees };
}

// Həftə zolağı üçün: hər gün neçə tapşırıq (geri alınanlar sayılmır) və onlardan neçəsi mənimdir
async function fetchWeek(from: string) {
  const { data } = await createClient().from("tasks").select("task_date, employee_id")
    .gte("task_date", from).lte("task_date", shift(from, 6)).is("cancelled_at", null);
  return data ?? [];
}

type Task = Awaited<ReturnType<typeof fetchTasks>>["tasks"][number];

// Yer: mağaza/filial (şirkət adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer | silinib
function placeOf(t: Task) {
  if (t.stores) return `${t.stores.companies?.name ?? ""} · ${t.stores.code} ${t.stores.name}`;
  if (t.companies) return t.companies.name;
  return t.place_text ?? "Yer silinib";
}
const placeIcon = (t: Task) => (t.stores ? Store : t.companies ? Building2 : MapPin);

// Halqa: görülən / cəmi (mənim günüm kartında)
function Ring({ done, total }: { done: number; total: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const part = total ? done / total : 0;
  return (
    <div className="relative grid h-[76px] w-[76px] shrink-0 place-items-center">
      <svg viewBox="0 0 76 76" className="absolute inset-0 -rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="7" />
        <circle cx="38" cy="38" r={r} fill="none" stroke="#4ade80" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - part)} className="transition-[stroke-dashoffset] duration-500" />
      </svg>
      <span className="text-lg font-extrabold tabular-nums">{done}<span className="text-white/45">/{total}</span></span>
    </div>
  );
}

function Tile({ label, value, tone = "" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="card flex flex-col justify-center !py-3">
      <span className="muted text-xs font-medium">{label}</span>
      <span className={`text-2xl font-extrabold tabular-nums ${tone}`}>{value}</span>
    </div>
  );
}

// Tapşırıqlar: admin/rəhbərlik ustaya gün üçün iş verir (admin paneldə). Hamı görür; usta yalnız ÖZ tapşırığını "görüldü" işarələyir.
// Düzülüş: həftə zolağı (gün seçimi, hər gündə say) → mənim günüm (halqa) + komandanın rəqəmləri → mənim tapşırıqlarım (iri kartlar) → komanda (usta kartları).
export function TasksView() {
  const [today] = useState(() => iso(new Date()));
  const [day, setDay] = useState(today);
  const [me, setMe] = useState<number | null | undefined>(undefined);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchTasks>> | null>(null);
  const [week, setWeek] = useState<{ from: string; rows: Awaited<ReturnType<typeof fetchWeek>> } | null>(null);
  const [noteFor, setNoteFor] = useState<Task | null>(null); // təmir barədə yazı pəncərəsi
  const from = weekStart(day);

  useEffect(() => {
    let cancelled = false;
    createClient().rpc("my_employee_id").then(({ data: id }) => { if (!cancelled) setMe(id ?? null); });
    return () => { cancelled = true; };
  }, []);

  const load = useCallback(() => {
    fetchTasks(day).then(setData);
    fetchWeek(from).then((rows) => setWeek({ from, rows }));
  }, [day, from]);
  useEffect(() => {
    let cancelled = false;
    fetchTasks(day).then((d) => { if (!cancelled) setData(d); });
    return () => { cancelled = true; };
  }, [day]);
  useEffect(() => {
    let cancelled = false;
    fetchWeek(from).then((rows) => { if (!cancelled) setWeek({ from, rows }); });
    return () => { cancelled = true; };
  }, [from]);
  // Admin tapşırıq verəndə, dəyişəndə və ya başqa usta işarələyəndə siyahı dərhal yenilənir (Realtime, TasksListener)
  useEffect(() => {
    window.addEventListener(TASKS_CHANGED, load);
    return () => window.removeEventListener(TASKS_CHANGED, load);
  }, [load]);

  async function toggle(t: Task) {
    // Dərhal əks olunur, xəta olsa geri qayıdır
    setData((d) => d && { ...d, tasks: d.tasks.map((x) => (x.id === t.id ? { ...x, done: !t.done } : x)) });
    // Görüldü: iş avtomatik "Görülən işlər"ə düşür; geri alınanda boş avtomatik iş silinir (bazada task_set_done)
    const { error } = await createClient().rpc("task_set_done", { p_task_id: t.id, p_done: !t.done });
    if (error) toast.error(error.message);
    else if (!t.done) toast.success("Tapşırıq görüldü, iş qeydə alındı");
    load();
  }

  const groups = useMemo(() => {
    if (!data) return [];
    return data.employees
      .map((e) => ({ employee: e, items: data.tasks.filter((t) => t.employee_id === e.id) }))
      .filter((g) => g.items.length > 0 && g.employee.id !== me);
  }, [data, me]);
  const mine = data?.tasks.filter((t) => t.employee_id === me) ?? [];
  const mineLive = mine.filter((t) => !t.cancelled_at);
  const live = data?.tasks.filter((t) => !t.cancelled_at) ?? []; // geri alınanlar saya düşmür
  const doneAll = live.filter((t) => t.done).length;
  const people = new Set(live.map((t) => t.employee_id)).size;

  const days = Array.from({ length: 7 }, (_, i) => shift(from, i));
  const rows = week?.from === from ? week.rows : [];
  const [, fm, fd] = from.split("-").map(Number);
  const lastDay = shift(from, 6);
  const [, lm, ld] = lastDay.split("-").map(Number);
  const range = fm === lm ? `${fd}–${ld} ${MONTHS[fm - 1]}` : `${fd} ${MONTHS[fm - 1]} – ${ld} ${MONTHS[lm - 1]}`;

  return (
    <div className="space-y-5">
      {noteFor && <TaskNoteModal key={noteFor.id} task={{
        id: noteFor.id, logId: noteFor.work_log_id, reason: noteFor.reason, place: placeOf(noteFor),
        // Əvvəl yazılan: tapşırıqdakı yazı, yoxdursa iş qeydinin təsviri (avtomatik yaranan təsvir = səbəb sayılmır)
        note: noteFor.note ?? (noteFor.work_logs && noteFor.work_logs.description !== `Tapşırıq: ${noteFor.reason}` ? noteFor.work_logs.description : null),
      }} onClose={() => setNoteFor(null)} onSaved={load} />}

      {/* Həftə zolağı: 7 gün, hər gündə tapşırıq sayı; mənim tapşırığım olan gündə nöqtə */}
      <section className="card !p-3">
        <div className="mb-2 flex items-center gap-2 px-1">
          <button type="button" onClick={() => setDay(shift(day, -7))} className="icon-btn" aria-label="Əvvəlki həftə"><ChevronLeft size={18} /></button>
          <p className="text-sm font-bold">{range}</p>
          <button type="button" onClick={() => setDay(shift(day, 7))} className="icon-btn" aria-label="Sonrakı həftə"><ChevronRight size={18} /></button>
          <p className="muted ml-2 truncate text-sm max-sm:hidden">{day === today ? "Bu gün" : formatDateAz(day)}</p>
          {day !== today && <button type="button" onClick={() => setDay(today)} className="btn btn-soft btn-sm ml-auto">Bu günə qayıt</button>}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d, i) => {
            const count = rows.filter((r) => r.task_date === d).length;
            const mineHere = rows.some((r) => r.task_date === d && r.employee_id === me);
            const selected = d === day;
            return (
              <button key={d} type="button" onClick={() => setDay(d)} aria-pressed={selected}
                className={`relative flex flex-col items-center rounded-xl py-2 transition-colors ${
                  selected ? "bg-gradient-to-br from-[#0f2a55] to-primary text-white shadow-[0_10px_24px_-12px_rgba(31,111,235,0.9)]"
                    : d === today ? "bg-primary-soft text-primary hover:bg-[#dbe8fd]" : "hover:bg-bg"}`}>
                <span className={`text-[11px] font-semibold ${selected ? "text-white/70" : "text-muted"}`}>{WEEKDAYS[i]}</span>
                <span className="text-lg font-extrabold tabular-nums leading-tight">{Number(d.slice(8))}</span>
                <span className={`mt-0.5 h-5 min-w-5 rounded-full px-1.5 text-[11px] font-bold leading-5 tabular-nums ${
                  count ? (selected ? "bg-white/20" : "bg-bg text-ink") : "opacity-0"}`}>{count}</span>
                {mineHere && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff9f1c]" title="Sənin tapşırığın var" />}
              </button>
            );
          })}
        </div>
      </section>

      {data === null ? (
        <div className="card muted py-16 text-center text-sm">Yüklənir...</div>
      ) : live.length === 0 && mine.length === 0 && groups.length === 0 ? (
        <div className="card py-16 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary-soft to-[#e6f8fc] text-primary">
            <ListChecks size={28} />
          </span>
          <p className="mt-4 text-lg font-bold">{day === today ? "Bu gün" : formatDateAz(day)} üçün tapşırıq yoxdur</p>
          <p className="muted mt-1 text-sm">Tapşırıqları admin və rəhbərlik verir. Yeni tapşırıq gələndə burada dərhal görünəcək.</p>
        </div>
      ) : (
        <>
          {/* Mənim günüm (halqa) + komandanın rəqəmləri */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <section className="flex items-center gap-5 rounded-[18px] bg-[#0c1b36] bg-[radial-gradient(420px_200px_at_100%_0%,rgba(34,195,230,0.22),transparent_70%)] px-6 py-5 text-white">
              <Ring done={mineLive.filter((t) => t.done).length} total={mineLive.length} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Mənim günüm</p>
                <p className="mt-1 text-xl font-extrabold">
                  {me === null ? "Əməkdaş kartın yoxdur"
                    : mineLive.length === 0 ? "Sənə tapşırıq verilməyib"
                    : mineLive.every((t) => t.done) ? "Hamısı görülüb 🎉"
                    : `${mineLive.filter((t) => !t.done).length} tapşırıq qalıb`}
                </p>
                <p className="mt-0.5 text-sm text-white/55">Görüldü işarələyəndə iş avtomatik «Görülən işlər»ə düşür.</p>
              </div>
            </section>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4">
              <Tile label="Cəmi tapşırıq" value={live.length} />
              <Tile label="Görülən" value={doneAll} tone="text-ok" />
              <Tile label="Qalan" value={live.length - doneAll} tone={live.length - doneAll ? "text-primary" : ""} />
              <Tile label="Usta" value={people} />
            </div>
          </div>

          {/* Mənim tapşırıqlarım: iri kartlar, işarələmək yalnız burada */}
          {mine.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
                Mənim tapşırıqlarım
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{mineLive.length}</span>
              </h2>
              {/* Natamam son sıra bütün eni tutur (tək kart yarı endə qalmır) */}
              <ul className="flex flex-wrap gap-3">
                {mine.map((t) => {
                  const cancelled = !!t.cancelled_at; // admin geri alıb: tarixçə kimi qalır, işarələnmir
                  const Icon = placeIcon(t);
                  const files = t.work_logs?.work_files.length ?? 0;
                  return (
                    <li key={t.id} className={`card flex min-w-0 grow basis-[440px] items-start gap-4 !p-4 transition-colors ${
                      cancelled ? "opacity-60" : t.done ? "!border-[#bfe8cf] !bg-[#f3fbf6]" : "hover:!border-[#c9dafb]"}`}>
                      <button type="button" disabled={cancelled} onClick={() => toggle(t)} aria-pressed={t.done}
                        title={cancelled ? "Geri alınıb" : t.done ? "Görülməyib kimi işarələ" : "Görüldü kimi işarələ"}
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition-all disabled:cursor-default ${
                          cancelled ? "border-line bg-bg text-muted"
                            : t.done ? "border-ok bg-ok text-white shadow-[0_6px_16px_-6px_rgba(18,161,80,0.8)]"
                            : "border-[#c9dafb] text-transparent hover:border-ok hover:bg-ok-soft hover:text-ok"}`}>
                        {cancelled ? <Undo2 size={18} strokeWidth={2.6} /> : <Check size={20} strokeWidth={3} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`flex items-center gap-1.5 text-sm font-bold ${cancelled ? "text-muted line-through" : t.done ? "text-ok" : "text-primary"}`}>
                          <Icon size={15} className="shrink-0" /><span className="truncate">{placeOf(t)}</span>
                        </p>
                        <p className={`mt-0.5 ${cancelled ? "text-muted line-through" : "text-ink"}`}>{t.reason}</p>
                        {t.note && <p className="mt-1.5 rounded-lg bg-[#fff7ed] px-2.5 py-1.5 text-xs text-[#b45309]"><b>Təmir:</b> {t.note}</p>}
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          {cancelled ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-bg px-2.5 py-1 text-xs font-semibold text-muted">
                              Geri alınıb{t.nextName && <><ArrowRight size={12} /> {t.nextName}</>}
                            </span>
                          ) : t.done ? (
                            <span className="rounded-full bg-ok-soft px-2.5 py-1 text-xs font-bold text-ok">Görüldü</span>
                          ) : (
                            <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">Gözləyir</span>
                          )}
                          {files > 0 && <span className="inline-flex items-center gap-1 text-xs text-muted" title="Əlavə olunmuş fayllar"><Paperclip size={13} />{files}</span>}
                          {/* Görülmüş tapşırıqda: təmir barədə yaz, akt/şəkil əlavə et */}
                          {t.done && !cancelled && (
                            <button type="button" onClick={() => setNoteFor(t)} className="btn btn-sm ml-auto !h-8 bg-ok-soft text-ok hover:bg-ok hover:text-white">
                              <PenLine size={14} /> {t.note || files ? "Təmir qeydi" : "Təmir barədə yaz"}
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Komanda: digər ustaların tapşırıqları (yalnız baxış) */}
          {groups.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
                <Users size={17} className="text-muted" /> Komanda
              </h2>
              <div className="flex flex-wrap gap-3">
                {groups.map(({ employee, items }) => {
                  const liveItems = items.filter((t) => !t.cancelled_at);
                  const done = liveItems.filter((t) => t.done).length;
                  return (
                    <section key={employee.id} className="card min-w-0 grow basis-[340px] !p-4">
                      <header className="flex items-center gap-3">
                        <Avatar employee={employee} className="!h-9 !w-9 !text-xs" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{employee.full_name}</span>
                          <span className="muted block text-xs">{done}/{liveItems.length} görülüb</span>
                        </span>
                        {liveItems.length > 0 && done === liveItems.length && <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-bold text-ok">Hazır</span>}
                      </header>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg">
                        <div className="h-full rounded-full bg-gradient-to-r from-ok to-[#4ade80] transition-[width] duration-500"
                          style={{ width: `${liveItems.length ? (done / liveItems.length) * 100 : 0}%` }} />
                      </div>
                      <ul className="mt-3 space-y-2">
                        {items.map((t) => {
                          const cancelled = !!t.cancelled_at;
                          return (
                            <li key={t.id} className={`flex items-start gap-2.5 text-sm ${cancelled ? "opacity-60" : ""}`}>
                              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                                cancelled ? "bg-bg text-muted" : t.done ? "bg-ok text-white" : "border-2 border-line"}`}>
                                {cancelled ? <Undo2 size={11} strokeWidth={3} /> : t.done ? <Check size={12} strokeWidth={3} /> : null}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className={`block truncate font-semibold ${cancelled ? "text-muted line-through" : t.done ? "text-ok" : ""}`}>{placeOf(t)}</span>
                                <span className={`block truncate text-xs ${cancelled ? "line-through" : ""} text-muted`}>
                                  {t.reason}{cancelled && t.nextName && <> · → {t.nextName}</>}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
