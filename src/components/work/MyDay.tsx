"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CalendarDays, CalendarOff, CalendarRange, ListChecks, LogIn, LogOut, Wrench } from "lucide-react";
import { AttendanceCalendar } from "@/components/employees/AttendanceCalendar";
import { presenceText, timeBaku, todayBaku, useMonthAttendance } from "@/lib/attendance";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { LeaveModal } from "./LeaveModal";
import { TASKS_CHANGED } from "@/lib/tasks-live";

// İş yazılanda (həm burada, həm başqa yerdə) bu hadisə atılır: sayğac və iş siyahısı yenilənir
export const WORK_SAVED = "work-saved";

// Yerli tarix "YYYY-MM-DD"
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Stats = {
  today: number;
  month: number;
  tasks: { total: number; done: number }; // bugünkü tapşırıqlarım (geri alınanlar yox)
  tools: number; // məndə olan alətlərin ədədi
  materials: number; // məndə olan materialın növ sayı
};

async function fetchStats(employeeId: number): Promise<Stats> {
  const supabase = createClient();
  const today = todayIso();
  const [day, month, tasks, held] = await Promise.all([
    supabase.from("work_logs").select("id", { count: "exact", head: true }).eq("employee_id", employeeId).eq("work_date", today),
    supabase.from("work_logs").select("id", { count: "exact", head: true }).eq("employee_id", employeeId).gte("work_date", `${today.slice(0, 8)}01`).lte("work_date", today),
    supabase.from("tasks").select("done").eq("employee_id", employeeId).eq("task_date", today).is("cancelled_at", null),
    supabase.from("tool_assignments").select("quantity, tools(kind)").eq("employee_id", employeeId).is("returned_at", null),
  ]);
  const h = held.data ?? [];
  return {
    today: day.count ?? 0,
    month: month.count ?? 0,
    tasks: { total: tasks.data?.length ?? 0, done: tasks.data?.filter((t) => t.done).length ?? 0 },
    tools: h.filter((a) => a.tools?.kind !== "material").reduce((s, a) => s + a.quantity, 0),
    materials: h.filter((a) => a.tools?.kind === "material").length,
  };
}

// Kiçik göstərici xanası (link verilsə klik olunur)
function Stat({ icon: Icon, label, value, sub, href }: { icon: typeof Wrench; label: string; value: React.ReactNode; sub?: string; href?: string }) {
  const body = (
    <>
      <span className="muted flex items-center gap-1.5 text-xs font-semibold"><Icon size={13} className="text-primary" /> {label}</span>
      <span className="mt-0.5 block truncate text-lg font-bold leading-tight">
        {value}{sub && <span className="muted ml-1 text-xs font-semibold">{sub}</span>}
      </span>
    </>
  );
  const cls = "min-w-0 rounded-xl bg-bg px-3 py-2";
  return href
    ? <Link href={href} className={`${cls} transition-colors hover:bg-primary-soft`}>{body}</Link>
    : <div className={cls}>{body}</div>;
}

// Mənim bugünüm: davamiyyət ("İşə gəldim" / vəziyyət, "İcazə istə"), dörd göstərici (bu gün, bu ay, bugünkü tapşırıqlar, məndə olan alət/material) "İş əlavə et" üst zolaqdadır (hər səhifədə, components/panel/TopbarTools.tsx).
// Əməkdaş kartı olmayan hesabda (məs. yalnız admin) görünmür. Tapşırıq dəyişəndə (Realtime) və iş yazılanda yenilənir.
export function MyDay() {
  // undefined = yüklənir, null = əməkdaş kartı yoxdur
  const [me, setMe] = useState<{ id: number; name: string } | null | undefined>(undefined);
  const [stats, setStats] = useState<Stats | null>(null);
  const [leaving, setLeaving] = useState(false); // "İcazə istə" pəncərəsi
  const [checking, setChecking] = useState(false);
  const [calendar, setCalendar] = useState(false); // davamiyyət təqvimi
  const [tick, setTick] = useState(0);
  const attendance = useMonthAttendance(); // bu günün vəziyyəti Realtime ilə
  const mine = me && attendance ? attendance.byEmployee.get(me.id) ?? attendance.empty : null;

  async function checkIn() {
    setChecking(true);
    const { data, error } = await createClient().rpc("check_in");
    setChecking(false);
    if (error) return toast.error(error.message);
    toast.success("İşə gəldin", data ? `Başlama saatı: ${timeBaku(data)}` : undefined);
  }

  // İcazəli gündə icazəyə ehtiyac qalmadı: bugünkü icazə ləğv olunur (leave_cancel) və işə gəlmə yazılır
  async function giveUpLeave() {
    if (!me) return;
    setChecking(true);
    const supabase = createClient();
    const t = todayBaku();
    const { data: lv } = await supabase.from("leave_requests").select("id").eq("employee_id", me.id).eq("status", "approved")
      .lte("date_from", t).gte("date_to", t).maybeSingle();
    const cancel = lv ? await supabase.rpc("leave_cancel", { p_id: lv.id }) : { error: null };
    if (cancel.error) {
      setChecking(false);
      return toast.error(cancel.error.message);
    }
    const { data, error } = await supabase.rpc("check_in");
    setChecking(false);
    if (error) return toast.error(error.message);
    toast.success("İcazə ləğv edildi, işə gəldin", data ? `Başlama saatı: ${timeBaku(data)}` : undefined);
  }

  // Axşam: "İşi bitirdim" (bitmə saatı yazılır, gündə bir dəfə)
  async function checkOut() {
    setChecking(true);
    const { data, error } = await createClient().rpc("check_out");
    setChecking(false);
    if (error) return toast.error(error.message);
    toast.success("İş günü bitdi", data ? `Bitmə saatı: ${timeBaku(data)}` : undefined);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: id } = await supabase.rpc("my_employee_id");
      if (!id) {
        if (!cancelled) setMe(null);
        return;
      }
      const { data: emp } = await supabase.from("employees").select("full_name").eq("id", id).maybeSingle();
      if (!cancelled) setMe({ id, name: emp?.full_name ?? "" });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onChange = () => setTick((t) => t + 1);
    window.addEventListener(WORK_SAVED, onChange);
    window.addEventListener(TASKS_CHANGED, onChange);
    return () => {
      window.removeEventListener(WORK_SAVED, onChange);
      window.removeEventListener(TASKS_CHANGED, onChange);
    };
  }, []);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    fetchStats(me.id).then((s) => {
      if (!cancelled) setStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, [me, tick]);

  if (me === null) return null;
  const s = stats;
  const open = s ? s.tasks.total - s.tasks.done : 0;

  // Bu günün davamiyyəti: "İşə gəldim" → gün boyu "İşdəsən · 09:02-dən" + "İşi bitirdim" → "İşi bitirdin · 09:02 – 18:10".
  // Təsdiqlənmiş icazə günü "icazəlisən" (Realtime: admin təsdiqləyən kimi dəyişir)
  const day = mine?.today;
  const p = day?.presence;
  const pill = (cls: string, text: string) => <span title={text} className={`dpill rounded-full px-3 py-1.5 text-center text-xs font-bold max-sm:col-span-2 max-sm:py-2 sm:max-lg:min-w-0 sm:max-lg:truncate ${cls}`}>{text}</span>;
  // Bir neçə seans (yenidən işə çıxıb): nişan qısadır (indiki seans və ya cəmi müddət), seanslar aşağıda nömrəli siyahıdadır
  const multi = !!p && p.sessions.length > 1;
  const last = p?.sessions[p.sessions.length - 1];
  const status = (label: string) => !p ? label
    : !multi ? `${label} · ${presenceText(p)}`
    : !p.out && last ? `${label} · ${timeBaku(last.in)}-dən`
    : `${label} · ${durShort(p.minutes)}`;
  const mins = (a: string, b: string) => Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));
  const durShort = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} saat ${m % 60} dəq` : `${Math.max(1, m)} dəq`);
  const presence = !day ? (
    <span className="muted text-sm">…</span>
  ) : day.status === "pending" ? (
    <button type="button" onClick={checkIn} disabled={checking} className="btn btn-sm !h-9 bg-ok text-white hover:brightness-110">
      <LogIn size={15} /> {checking ? "..." : "İşə gəldim"}
    </button>
  ) : day.status === "present" && p && !p.out ? (
    <>
      {pill("bg-ok-soft text-ok", status("İşdəsən"))}
      <button type="button" onClick={checkOut} disabled={checking} className="btn btn-sm !h-9 bg-navy text-white hover:brightness-125">
        <LogOut size={15} /> {checking ? "..." : "İşi bitirdim"}
      </button>
    </>
  ) : day.status === "present" && p ? (
    <>
      {pill("bg-bg text-ink", status("İşi bitirdin"))}
      {/* Təcili iş çıxsa yenidən işə çıxır: yeni seans açılır (0066), sonra yenə "İşi bitirdim" */}
      <button type="button" onClick={checkIn} disabled={checking} className="btn btn-soft btn-sm !h-9" title="Yeni seans açılır">
        <LogIn size={15} /> {checking ? "..." : "Yenidən işə çıxdım"}
      </button>
    </>
  ) : day.status === "leave" ? (
    <>
      {pill("bg-violet-50 text-violet-700", "Bu gün icazəlisən")}
      <button type="button" onClick={giveUpLeave} disabled={checking} className="btn btn-soft btn-sm !h-9" title="İcazə ləğv olunur, işə gəlmə yazılır">
        <LogIn size={15} /> {checking ? "..." : "İcazəyə ehtiyac qalmadı, işdəyəm"}
      </button>
    </>
  ) : day.status === "absent" ? (
    // Admin bu günü "işdə olmayıb" qeyd edib (0065): usta işə gəldim basa bilmir, səhvdirsə admin geri alır
    pill("bg-danger-soft text-danger", "Bu gün işdə olmayıb qeyd olunub")
  ) : (
    // Bazar iş günü deyil, amma usta çağırılıbsa işə çıxdığını qeyd edə bilər (əlavə gün)
    <>
      {pill("bg-slate-200 text-slate-600", "Bazar: iş günü deyil")}
      <button type="button" onClick={checkIn} disabled={checking} className="btn btn-soft btn-sm !h-9" title="Bazar günü işə çağırılmısansa">
        <LogIn size={15} /> {checking ? "..." : "Bazar günü işdəyəm"}
      </button>
    </>
  );

  const leaveBtn = (cls: string) => (
    <button type="button" disabled={!me} onClick={() => setLeaving(true)} className={`btn btn-soft btn-sm !h-9 ${cls}`} title="İcazə sorğusu: admin təsdiqləyir">
      <CalendarOff size={15} /> İcazə istə{mine?.pendingLeave ? ` (${mine.pendingLeave})` : ""}
    </button>
  );

  return (
    <section className="card space-y-3 !py-4">
      {leaving && me && <LeaveModal employeeId={me.id} onClose={() => setLeaving(false)} />}
      {calendar && me && <AttendanceCalendar employeeId={me.id} name={me.name} onClose={() => setCalendar(false)} />}
      <div className="flex flex-wrap items-center gap-3">
        <span className="icon-tile shrink-0"><CalendarCheck size={20} /></span>
        <p className="muted text-xs font-semibold uppercase tracking-wide max-sm:flex-1 sm:max-lg:hidden">Mənim bugünüm</p>
        {/* Planşetdə başlıq yazısı gizlidir ki, hamısı bir sətrə sığsın. < 640: vəziyyət və düymələr ayrıca sətirdə: nişan üstdə tam endə, düymələr altda yarı-yarı
            (nişandan sonra tək düymə qalırsa o da tam endə); uzun düymə mətni sətrə keçə bilir */}
        <div className="flex items-center gap-2 sm:[&>.dpill]:whitespace-nowrap sm:max-lg:min-w-0 sm:max-lg:flex-1 sm:max-lg:[&>button]:shrink-0 max-sm:order-last max-sm:w-full max-sm:[&>*]:justify-center max-sm:grid max-sm:grid-cols-2 max-sm:[&>.dpill+*:last-child]:col-span-2 max-sm:[&>button]:!h-auto max-sm:[&>button]:min-h-9 max-sm:[&>button]:py-2 max-sm:[&>button]:leading-tight">{presence}{leaveBtn("sm:hidden")}</div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button type="button" disabled={!me} onClick={() => setCalendar(true)} className="icon-btn !h-9 !w-9" title="Davamiyyət təqvimim" aria-label="Davamiyyət təqvimim">
            <CalendarRange size={16} />
          </button>
          {leaveBtn("max-sm:hidden")}
        </div>
      </div>
      {/* Bugünkü seanslar: hər biri ayrıca sətir, nömrə ilə (yalnız yenidən işə çıxanda) */}
      {multi && p && (
        <ol className="divide-y divide-line rounded-xl border border-line">
          {p.sessions.map((x, i) => (
            <li key={x.in} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${x.out ? "bg-bg text-muted" : "bg-ok text-white"}`}>{i + 1}</span>
              <span className="font-semibold tabular-nums">{timeBaku(x.in)} – {x.out ? timeBaku(x.out) : "…"}</span>
              <span className={`ml-auto text-xs font-semibold tabular-nums ${x.out ? "text-muted" : "text-ok"}`}>{x.out ? durShort(mins(x.in, x.out)) : "indi işdəsən"}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={CalendarCheck} label="Bu gün" value={s ? <span className={s.today ? "text-primary" : ""}>{s.today}</span> : "…"} sub="iş" />
        <Stat icon={CalendarDays} label="Bu ay" value={s?.month ?? "…"} sub="iş" href="/statistika" />
        {/* Admin/rəhbərlik verdiyi bugünkü tapşırıqlar: klik → Tapşırıqlar səhifəsi */}
        <Stat icon={ListChecks} label="Tapşırıq" href="/tapshiriqlar"
          value={s ? <span className={open ? "text-primary" : s.tasks.total ? "text-ok" : ""}>{s.tasks.done}/{s.tasks.total}</span> : "…"}
          sub={s?.tasks.total ? (open ? `${open} qalıb` : "hamısı görülüb") : undefined} />
        <Stat icon={Wrench} label="Məndə" value={s?.tools ?? "…"} sub={s ? `alət${s.materials ? ` · ${s.materials} material` : ""}` : undefined} />
      </div>
    </section>
  );
}
