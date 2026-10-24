"use client";

import { useCallback, useMemo, useState } from "react";
import { CalendarClock, CalendarOff, History, Plus, Trash2 } from "lucide-react";
import { emitPanel, PANEL_EVENTS } from "@/components/panel/nav";
import { MONTHS_AZ, leaveRange, leaveWorkdays, todayBaku, useAttendanceLive, type Leave } from "@/lib/attendance";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

type Row = Leave & { decided_at: string | null };
type Filter = "all" | "approved" | "rejected" | "cancelled";

const STATUS = {
  pending: { text: "Gözləyir", cls: "bg-primary-soft text-primary", bar: "bg-primary" },
  approved: { text: "Təsdiqləndi", cls: "bg-ok-soft text-ok", bar: "bg-ok" },
  rejected: { text: "Rədd edildi", cls: "bg-danger-soft text-danger", bar: "bg-danger" },
  cancelled: { text: "Ləğv etdin", cls: "bg-bg text-muted", bar: "bg-[#98a2b3]" },
} as const;
const statusOf = (s: string) => STATUS[s as keyof typeof STATUS] ?? STATUS.pending;

// "21.10.2026 18:41" (Bakı vaxtı)
function stamp(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Baku", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
    .format(new Date(iso)).replace(",", "").replaceAll("/", ".");
}

// Bir sorğunun kartı: tarix bloku, gün sayı, səbəb, vəziyyət; aktivlərdə "Ehtiyac qalmadı" / "Geri götür"
function LeaveCard({ l, today, onGiveUp, onCancel }: { l: Row; today: string; onGiveUp?: () => void; onCancel?: () => void }) {
  const st = statusOf(l.status);
  const ongoing = l.status === "approved" && l.date_from <= today && today <= l.date_to;
  return (
    <li className="card flex min-w-0 items-stretch gap-4 overflow-hidden !p-0">
      <span className={`w-1.5 shrink-0 ${st.bar}`} />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 py-3 pr-4 max-sm:items-start">
        <div className="min-w-0 flex-[1_1_220px] max-sm:flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-[15px]">
            <span className="font-bold">{leaveRange(l)}</span>
            <span className="muted text-sm">· {leaveWorkdays(l)} iş günü</span>
            {ongoing && <span className="rounded-full bg-[#fff6e5] px-2 py-0.5 text-[11px] font-semibold text-amber-700">İndi icazədəsən</span>}
          </p>
          <p className="muted line-clamp-2 text-sm">{l.reason || "Səbəb yazılmayıb"}</p>
          <p className="muted text-[11px]">Göndərilib: {stamp(l.created_at)}{l.decided_at && ` · cavab: ${stamp(l.decided_at)}`}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.text}</span>
        {onGiveUp && (
          <button type="button" onClick={onGiveUp} className="btn btn-soft btn-sm shrink-0 max-sm:w-full" title="İcazəni ləğv et, işə gəl">Ehtiyac qalmadı</button>
        )}
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-soft btn-sm shrink-0 text-danger max-sm:w-full" title="Sorğunu geri götür">
            <Trash2 size={14} /> Geri götür
          </button>
        )}
      </div>
    </li>
  );
}

// İcazələrim: xülasə + "İcazə istə" (qlobal LeaveModal), aktiv və gözləyən sorğular, aylara görə tarixçə (statusla süzgəc). Realtime.
export function MyLeaves({ employeeId }: { employeeId: number | null }) {
  const today = todayBaku();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    if (!employeeId) return setRows([]);
    const { data } = await createClient().from("leave_requests")
      .select("id, employee_id, date_from, date_to, reason, status, created_at, decided_at")
      .eq("employee_id", employeeId).order("date_from", { ascending: false }).limit(300);
    setRows(data ?? []);
  }, [employeeId]);
  useAttendanceLive(load);

  async function giveUp(l: Row) {
    const { error } = await createClient().rpc("leave_cancel", { p_id: l.id });
    if (error) return toast.error(error.message);
    toast.success("İcazə ləğv edildi", "İşə gələ bilərsən");
    void load();
  }
  async function cancel(l: Row) {
    const { error } = await createClient().from("leave_requests").delete().eq("id", l.id);
    if (error) return toast.error(error.message);
    toast.success("Sorğu geri götürüldü");
    void load();
  }

  const { active, past, stats } = useMemo(() => {
    const all = rows ?? [];
    // Aktiv: gözləyən və ya hələ bitməmiş təsdiqli icazə; qalanı tarixçə
    const active = all.filter((l) => l.status === "pending" || (l.status === "approved" && l.date_to >= today))
      .sort((a, b) => a.date_from.localeCompare(b.date_from));
    const past = all.filter((l) => !active.includes(l));
    const year = today.slice(0, 4);
    const month = today.slice(0, 7);
    const approved = all.filter((l) => l.status === "approved");
    // İlin/ayın icazə günləri: aralığın həmin dövrə düşən iş günləri
    const daysIn = (prefix: string) => approved.reduce((n, l) => {
      const from = l.date_from.startsWith(prefix) ? l.date_from : l.date_from < prefix ? `${prefix}${prefix.length === 4 ? "-01-01" : "-01"}` : null;
      const to = l.date_to.startsWith(prefix) ? l.date_to : l.date_to > prefix ? `${prefix}${prefix.length === 4 ? "-12-31" : "-31"}` : null;
      return from && to && from <= to ? n + leaveWorkdays({ date_from: from, date_to: to }) : n;
    }, 0);
    return {
      active, past,
      stats: {
        year: daysIn(year), month: daysIn(month), pending: all.filter((l) => l.status === "pending").length,
        // Növbəti təsdiqli icazə (hələ başlamamış)
        next: approved.filter((l) => l.date_from > today).sort((a, b) => a.date_from.localeCompare(b.date_from))[0] ?? null,
      },
    };
  }, [rows, today]);

  if (!employeeId) {
    return <div className="card muted py-12 text-center text-sm">İcazə yalnız usta kartı olan hesabla istənilir.</div>;
  }

  const shown = filter === "all" ? past : past.filter((l) => l.status === filter);
  const byMonth = new Map<string, Row[]>();
  for (const l of shown) {
    const k = l.date_from.slice(0, 7);
    byMonth.set(k, [...(byMonth.get(k) ?? []), l]);
  }
  const chip = (value: Filter, label: string) => {
    const n = value === "all" ? past.length : past.filter((l) => l.status === value).length;
    return (
      <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value}
        className={`flex h-9 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors max-sm:justify-center max-sm:px-2 ${
          filter === value ? "bg-[#0c1b36] text-white" : "bg-surface text-muted ring-1 ring-line hover:text-ink"}`}>
        {label}<span className={`rounded-full px-1.5 text-xs tabular-nums ${filter === value ? "bg-white/15" : "bg-bg"}`}>{n}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-x-10 gap-y-4 rounded-[18px] max-sm:gap-y-3 max-sm:px-4 bg-[#0c1b36] bg-[radial-gradient(520px_220px_at_100%_0%,rgba(34,195,230,0.22),transparent_70%)] px-6 py-5 text-white">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-frost"><CalendarOff size={26} /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">İcazələrim</p>
            <p className="text-2xl font-extrabold leading-tight">{stats.year} gün <span className="text-base font-semibold text-white/60">bu il</span></p>
          </div>
        </div>
        <dl className="flex flex-1 flex-wrap gap-x-10 gap-y-3 max-sm:grid max-sm:basis-full max-sm:grid-cols-3 max-sm:gap-2 max-sm:[&>div]:rounded-xl max-sm:[&>div]:bg-white/[0.07] max-sm:[&>div]:px-3 max-sm:[&>div]:py-2 max-sm:[&_dd]:text-lg">
          <div><dt className="text-xs text-white/55">Bu ay</dt><dd className="text-2xl font-extrabold tabular-nums">{stats.month} gün</dd></div>
          <div><dt className="text-xs text-white/55">Növbəti icazə</dt><dd className="text-2xl font-extrabold tabular-nums">{stats.next ? leaveRange(stats.next) : <span className="text-white/50">Yoxdur</span>}</dd></div>
          <div><dt className="text-xs text-white/55">Gözləyən</dt><dd className={`text-2xl font-extrabold tabular-nums ${stats.pending ? "text-frost" : ""}`}>{stats.pending}</dd></div>
        </dl>
        <button type="button" onClick={() => emitPanel(PANEL_EVENTS.leave)} className="btn shrink-0 !bg-white !text-[#0c1b36] hover:!bg-frost max-sm:w-full">
          <Plus size={16} /> İcazə istə
        </button>
      </section>

      {rows === null ? (
        <div className="card muted py-12 text-center text-sm">Yüklənir...</div>
      ) : (
        <>
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold"><CalendarClock size={18} className="text-primary" /> Aktiv və gözləyən</h2>
            {active.length === 0 ? (
              <p className="card muted py-8 text-center text-sm">İndi aktiv və ya gözləyən icazən yoxdur.</p>
            ) : (
              <ul className="space-y-2.5">
                {active.map((l) => (
                  <LeaveCard key={l.id} l={l} today={today}
                    onGiveUp={l.status === "approved" ? () => giveUp(l) : undefined}
                    onCancel={l.status === "pending" ? () => cancel(l) : undefined} />
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-center gap-2 max-sm:grid max-sm:grid-cols-2">
              <h2 className="mr-auto flex items-center gap-2 text-base font-bold max-sm:col-span-2"><History size={18} className="text-primary" /> Tarixçə</h2>
              {chip("all", "Hamısı")}
              {chip("approved", "Təsdiqlənən")}
              {chip("rejected", "Rədd edilən")}
              {chip("cancelled", "Ləğv etdiyim")}
            </div>
            {shown.length === 0 ? (
              <p className="card muted py-8 text-center text-sm">{past.length ? "Bu süzgəcə uyğun sorğu yoxdur." : "Hələ keçmiş icazən yoxdur."}</p>
            ) : (
              <div className="space-y-5">
                {[...byMonth].map(([k, list]) => (
                  <div key={k}>
                    <p className="muted mb-2 text-xs font-semibold uppercase tracking-wider">{MONTHS_AZ[Number(k.slice(5, 7)) - 1]} {k.slice(0, 4)}</p>
                    <ul className="space-y-2.5">{list.map((l) => <LeaveCard key={l.id} l={l} today={today} />)}</ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
