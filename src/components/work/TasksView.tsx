"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ListChecks, MapPin } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import { Avatar } from "@/components/employees/EmployeeList";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

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
      .select("id, employee_id, reason, done, place_text, stores(name, code, companies(name)), companies(name)")
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
    const { error } = await createClient().from("tasks").update({ done: !t.done }).eq("id", t.id);
    if (error) toast.error(error.message);
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
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setDay(shift(day, -1))} className="icon-btn" aria-label="Əvvəlki gün"><ChevronLeft size={18} /></button>
        <h2 className="min-w-44 text-center text-lg font-bold">{day === today ? "Bu gün" : formatDateAz(day)}</h2>
        <button type="button" onClick={() => setDay(shift(day, 1))} className="icon-btn" aria-label="Sonrakı gün"><ChevronRight size={18} /></button>
        {day !== today && <button type="button" onClick={() => setDay(today)} className="btn btn-soft btn-sm ml-1">Bu gün</button>}
        {mine.length > 0 && (
          <span className="ml-auto rounded-full bg-primary-soft px-3 py-1.5 text-sm font-bold text-primary">
            Sənin tapşırıqların: {mine.filter((t) => t.done).length} / {mine.length} görülüb
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
        groups.map(({ employee, items }) => {
          const isMe = employee.id === me;
          const done = items.filter((t) => t.done).length;
          return (
            <section key={employee.id} className={`card !p-0 ${isMe ? "ring-2 ring-primary/30" : ""}`}>
              <header className="flex items-center gap-3 border-b border-line px-5 py-3">
                <Avatar employee={employee} className="!h-9 !w-9 !text-xs" />
                <span className="flex-1 font-bold">{employee.full_name}{isMe && <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">Sən</span>}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${done === items.length ? "bg-ok-soft text-ok" : "bg-bg text-muted"}`}>{done} / {items.length}</span>
              </header>
              <ul>
                {items.map((t) => (
                  <li key={t.id} className="flex items-start gap-3 border-b border-line px-5 py-3 last:border-b-0">
                    {/* Yalnız öz tapşırığında işarələmək olur; başqasınınkı yalnız vəziyyəti göstərir */}
                    <button type="button" disabled={!isMe} onClick={() => toggle(t)} aria-pressed={t.done}
                      title={isMe ? (t.done ? "Görülməyib kimi işarələ" : "Görüldü kimi işarələ") : t.done ? "Görülüb" : "Görülməyib"}
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-colors disabled:cursor-default ${
                        t.done ? "border-ok bg-ok text-white" : isMe ? "border-line text-transparent hover:border-primary" : "border-line text-transparent"}`}>
                      <Check size={14} strokeWidth={3} />
                    </button>
                    <span className="min-w-0 flex-1">
                      <span className={`flex items-center gap-1.5 text-sm font-semibold ${t.done ? "text-muted line-through" : "text-primary"}`}><MapPin size={13} className="shrink-0" /> {placeOf(t)}</span>
                      <span className={`mt-0.5 block text-sm ${t.done ? "muted line-through" : ""}`}>{t.reason}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
