"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, ListChecks, Paperclip, PenLine, Undo2 } from "lucide-react";
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

type Task = Awaited<ReturnType<typeof fetchTasks>>["tasks"][number];

// Yer: mağaza/filial (şirkət adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer | silinib
function placeOf(t: Task) {
  if (t.stores) return `${t.stores.companies?.name ?? ""} · ${t.stores.code} ${t.stores.name}`;
  if (t.companies) return t.companies.name;
  return t.place_text ?? "Yer silinib";
}

// Tapşırıqlar: admin/rəhbərlik ustaya gün üçün iş verir (admin paneldə). Hamı görür; usta yalnız ÖZ tapşırığını "görüldü" işarələyir.
export function TasksView() {
  const [today] = useState(() => iso(new Date()));
  const [day, setDay] = useState(today);
  const [me, setMe] = useState<number | null | undefined>(undefined);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchTasks>> | null>(null);
  const [noteFor, setNoteFor] = useState<Task | null>(null); // təmir barədə yazı pəncərəsi

  useEffect(() => {
    let cancelled = false;
    createClient().rpc("my_employee_id").then(({ data: id }) => { if (!cancelled) setMe(id ?? null); });
    return () => { cancelled = true; };
  }, []);

  const load = useCallback(() => fetchTasks(day).then(setData), [day]);
  useEffect(() => {
    let cancelled = false;
    fetchTasks(day).then((d) => { if (!cancelled) setData(d); });
    return () => { cancelled = true; };
  }, [day]);
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
      .filter((g) => g.items.length > 0)
      .sort((a, b) => Number(b.employee.id === me) - Number(a.employee.id === me)); // öz tapşırıqların birinci
  }, [data, me]);
  const mine = data?.tasks.filter((t) => t.employee_id === me && !t.cancelled_at) ?? [];

  return (
    <div className="space-y-4">
      {noteFor && <TaskNoteModal key={noteFor.id} task={{
        id: noteFor.id, logId: noteFor.work_log_id, reason: noteFor.reason, place: placeOf(noteFor),
        // Əvvəl yazılan: tapşırıqdakı yazı, yoxdursa iş qeydinin təsviri (avtomatik yaranan təsvir = səbəb sayılmır)
        note: noteFor.note ?? (noteFor.work_logs && noteFor.work_logs.description !== `Tapşırıq: ${noteFor.reason}` ? noteFor.work_logs.description : null),
      }} onClose={() => setNoteFor(null)} onSaved={load} />}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setDay(shift(day, -1))} className="icon-btn" aria-label="Əvvəlki gün"><ChevronLeft size={18} /></button>
        <h2 className="min-w-44 text-center text-lg font-bold">{day === today ? "Bu gün" : formatDateAz(day)}</h2>
        <button type="button" onClick={() => setDay(shift(day, 1))} className="icon-btn" aria-label="Sonrakı gün"><ChevronRight size={18} /></button>
        {day !== today && <button type="button" onClick={() => setDay(today)} className="btn btn-soft btn-sm ml-1">Bu gün</button>}
        {mine.length > 0 && (
          <span className="ml-auto rounded-full bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary">
            Sənin tapşırıqların: {mine.length} · görülən: {mine.filter((t) => t.done).length}
          </span>
        )}
      </div>

      {data === null ? (
        <div className="card muted py-12 text-center text-sm">Yüklənir...</div>
      ) : groups.length === 0 ? (
        <div className="card py-14 text-center">
          <span className="icon-tile mx-auto"><ListChecks size={20} /></span>
          <p className="mt-3 font-semibold">Bu gün üçün tapşırıq yoxdur</p>
          <p className="muted text-sm">Tapşırıqları admin və rəhbərlik verir.</p>
        </div>
      ) : (
        <div className="card !p-0">
          {groups.map(({ employee, items }) => {
            const isMe = employee.id === me;
            const live = items.filter((t) => !t.cancelled_at); // geri alınanlar saya düşmür
            const done = live.filter((t) => t.done).length;
            return (
              <section key={employee.id} className="border-b border-line last:border-b-0">
                <header className={`flex items-center gap-2.5 px-4 py-2 ${isMe ? "bg-primary-soft" : "bg-[#f8f9fc]"}`}>
                  <Avatar employee={employee} className="!h-6 !w-6 !text-[10px]" />
                  <span className="text-sm font-bold">{employee.full_name}</span>
                  {isMe && <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-primary">Sən</span>}
                  <span className="muted text-xs">{live.length} tapşırıq · {done} görülən</span>
                </header>
                <ul>
                  {items.map((t) => {
                    const cancelled = !!t.cancelled_at; // admin geri alıb: tarixçə kimi qalır, işarələnmir
                    return (
                    <li key={t.id} className={`flex items-center gap-3 px-4 py-1.5 ${cancelled ? "opacity-60" : ""}`}>
                      {/* Yalnız öz tapşırığında işarələmək olur; başqasınınkı yalnız vəziyyəti göstərir */}
                      <button type="button" disabled={!isMe || cancelled} onClick={() => toggle(t)} aria-pressed={t.done}
                        title={cancelled ? "Geri alınıb" : isMe ? (t.done ? "Görülməyib kimi işarələ" : "Görüldü kimi işarələ") : t.done ? "Görülüb" : "Görülməyib"}
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors disabled:cursor-default ${
                          cancelled ? "border-line bg-bg text-muted" : t.done ? "border-ok bg-ok text-white" : isMe ? "border-line text-transparent hover:border-primary" : "border-line text-transparent"}`}>
                        {cancelled ? <Undo2 size={11} strokeWidth={3} /> : <Check size={12} strokeWidth={3} />}
                      </button>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm ${cancelled ? "line-through" : ""}`}>
                          <span className={`font-semibold ${cancelled ? "text-muted" : t.done ? "text-ok" : "text-primary"}`}>{placeOf(t)}</span>
                          <span className="muted"> — </span>
                          <span className={cancelled ? "text-muted" : t.done ? "text-ok/80" : ""}>{t.reason}</span>
                        </span>
                        {t.note && <span className={`block truncate text-xs ${t.done ? "text-[#d97706]" : "muted"}`}><b>Təmir:</b> {t.note}</span>}
                      </span>
                      {/* Görülmüş öz tapşırığında: təmir barədə yaz, akt/şəkil əlavə et */}
                      {t.done && (isMe || t.note || (t.work_logs?.work_files.length ?? 0) > 0) && (
                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
                          {(t.work_logs?.work_files.length ?? 0) > 0 && <span className="inline-flex items-center gap-0.5" title="Əlavə olunmuş fayllar"><Paperclip size={13} />{t.work_logs?.work_files.length}</span>}
                          {isMe && (
                            <button type="button" onClick={() => setNoteFor(t)} title="Təmir barədə yaz, şəkil əlavə et"
                              className="grid h-7 w-7 place-items-center rounded-lg bg-ok-soft text-ok transition-colors hover:bg-ok hover:text-white">
                              <PenLine size={14} />
                            </button>
                          )}
                        </span>
                      )}
                      {cancelled && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-bg px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                          Geri alınıb{t.nextName && <><ArrowRight size={11} /> {t.nextName}</>}
                        </span>
                      )}
                    </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
