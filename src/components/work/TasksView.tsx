"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ListChecks, Paperclip, PenLine } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeList";
import { createClient } from "@/lib/supabase/client";
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
      .select("id, employee_id, reason, done, note, place_text, stores(name, code, companies(name)), companies(name), work_logs(work_files(id))")
      .eq("task_date", day).order("created_at").then((r) => r.data ?? []),
    supabase.from("employees").select("id, full_name, photo_url").eq("is_management", false).eq("is_active", true).order("full_name").then((r) => r.data ?? []),
  ]);
  return { tasks, employees };
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
  const mine = data?.tasks.filter((t) => t.employee_id === me) ?? [];

  return (
    <div className="space-y-4">
      {noteFor && <TaskNoteModal task={{ id: noteFor.id, reason: noteFor.reason, note: noteFor.note, place: placeOf(noteFor) }} onClose={() => setNoteFor(null)} onSaved={load} />}
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
            const done = items.filter((t) => t.done).length;
            return (
              <section key={employee.id} className="border-b border-line last:border-b-0">
                <header className={`flex items-center gap-2.5 px-4 py-2 ${isMe ? "bg-primary-soft" : "bg-[#f8f9fc]"}`}>
                  <Avatar employee={employee} className="!h-6 !w-6 !text-[10px]" />
                  <span className="text-sm font-bold">{employee.full_name}</span>
                  {isMe && <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-primary">Sən</span>}
                  <span className="muted text-xs">{items.length} tapşırıq · {done} görülən</span>
                </header>
                <ul>
                  {items.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 px-4 py-1.5">
                      {/* Yalnız öz tapşırığında işarələmək olur; başqasınınkı yalnız vəziyyəti göstərir */}
                      <button type="button" disabled={!isMe} onClick={() => toggle(t)} aria-pressed={t.done}
                        title={isMe ? (t.done ? "Görülməyib kimi işarələ" : "Görüldü kimi işarələ") : t.done ? "Görülüb" : "Görülməyib"}
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors disabled:cursor-default ${
                          t.done ? "border-ok bg-ok text-white" : isMe ? "border-line text-transparent hover:border-primary" : "border-line text-transparent"}`}>
                        <Check size={12} strokeWidth={3} />
                      </button>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">
                          <span className={`font-semibold ${t.done ? "text-ok" : "text-primary"}`}>{placeOf(t)}</span>
                          <span className="muted"> — </span>
                          <span className={t.done ? "text-ok/80" : ""}>{t.reason}</span>
                        </span>
                        {t.note && <span className="muted block truncate text-xs">Təmir: {t.note}</span>}
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
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
