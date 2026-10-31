import Link from "next/link";
import { CalendarCheck, CalendarDays, ListChecks, Wrench } from "lucide-react";
import type { MyDayStatProps, MyDayStatsGridProps } from "@/types/myWork";

// Kiçik göstərici xanası (link verilsə klik olunur)
function Stat({ icon: Icon, label, value, sub, href }: MyDayStatProps) {
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

// Dörd göstərici: bu gün, bu ay, bugünkü tapşırıqlar, məndə olan alət/material
export function MyDayStatsGrid({ s }: MyDayStatsGridProps) {
  const open = s ? s.tasks.total - s.tasks.done : 0;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Stat icon={CalendarCheck} label="Bu gün" value={s ? <span className={s.today ? "text-primary" : ""}>{s.today}</span> : "…"} sub="iş" />
      <Stat icon={CalendarDays} label="Bu ay" value={s?.month ?? "…"} sub="iş" href="/statistika" />
      {/* Admin/rəhbərlik verdiyi bugünkü tapşırıqlar: klik → Tapşırıqlar səhifəsi */}
      <Stat icon={ListChecks} label="Tapşırıq" href="/tapshiriqlar"
        value={s ? <span className={open ? "text-primary" : s.tasks.total ? "text-ok" : ""}>{s.tasks.done}/{s.tasks.total}</span> : "…"}
        sub={s?.tasks.total ? (open ? `${open} qalıb` : "hamısı görülüb") : undefined} />
      <Stat icon={Wrench} label="Məndə" value={s?.tools ?? "…"} sub={s ? `alət${s.materials ? ` · ${s.materials} material` : ""}` : undefined} />
    </div>
  );
}
