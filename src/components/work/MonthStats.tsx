"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarCheck, ChevronLeft, ChevronRight, ClipboardList, MapPin, Table2, TrendingDown, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const WEEKDAYS = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

type LogRow = {
  id: number;
  work_date: string;
  place_text: string | null;
  stores: { name: string; companies: { name: string } | null } | null;
  companies: { name: string } | null;
};

type MonthData = { key: string; logs: LogRow[]; prevCount: number; prevLabel: string };

// Seçilmiş ayın işləri + müqayisə üçün əvvəlki ayın sayı.
// Cari ayda əvvəlki ayın EYNİ dövrü (ilk N gün) götürülür: yarımçıq ayı tam ayla müqayisə etmək yanıltır.
async function fetchMonth(employeeId: number, y: number, m: number, today: { y: number; m: number; d: number }): Promise<MonthData> {
  const supabase = createClient();
  const days = new Date(y, m + 1, 0).getDate();
  const py = m === 0 ? y - 1 : y;
  const pm = m === 0 ? 11 : m - 1;
  const isCurrent = y === today.y && m === today.m;
  const pdays = new Date(py, pm + 1, 0).getDate();
  const [cur, prev] = await Promise.all([
    supabase.from("work_logs")
      .select("id, work_date, place_text, stores(name, companies(name)), companies(name)")
      .eq("employee_id", employeeId).gte("work_date", iso(y, m, 1)).lte("work_date", iso(y, m, days)),
    supabase.from("work_logs").select("id", { count: "exact", head: true })
      .eq("employee_id", employeeId).gte("work_date", iso(py, pm, 1)).lte("work_date", iso(py, pm, isCurrent ? Math.min(today.d, pdays) : pdays)),
  ]);
  return {
    key: `${y}-${m}`,
    logs: (cur.data ?? []) as LogRow[],
    prevCount: prev.count ?? 0,
    prevLabel: isCurrent ? "keçən ayın eyni dövrünə görə" : "əvvəlki aya görə",
  };
}

// İş yeri: mağaza/filial (şirkətin adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer
function placeOf(l: LogRow) {
  if (l.stores) return { key: `s:${l.stores.companies?.name}:${l.stores.name}`, label: `${l.stores.companies?.name ?? ""} · ${l.stores.name}` };
  if (l.companies) return { key: `c:${l.companies.name}`, label: l.companies.name };
  const t = l.place_text ?? "—";
  return { key: `t:${t}`, label: t };
}

// Y oxu: yuvarlaq, az sayda xətt (0 / orta / max). Dəyərlər kiçik tam ədədlərdir.
function niceTop(max: number) {
  const step = [1, 2, 5, 10, 20, 50].find((s) => max / s <= 4) ?? 100;
  return Math.max(step, Math.ceil(max / step) * step);
}

function Kpi({ icon: Icon, label, value, sub, delta }: {
  icon: typeof ClipboardList; label: string; value: string; sub?: string;
  delta?: { diff: number; text: string };
}) {
  return (
    <div className="card !p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon size={15} />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      {/* Böyük rəqəm: mütənasib rəqəmlər (tabular yalnız sütunlarda) */}
      <p className="mt-2 text-3xl font-extrabold leading-none">{value}</p>
      {delta ? (
        <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${delta.diff > 0 ? "text-ok" : delta.diff < 0 ? "text-danger" : "muted"}`}>
          {delta.diff > 0 ? <TrendingUp size={13} /> : delta.diff < 0 ? <TrendingDown size={13} /> : null}
          {delta.diff > 0 ? `+${delta.diff}` : delta.diff < 0 ? `−${Math.abs(delta.diff)}` : "Eyni"} <span className="muted font-medium">{delta.text}</span>
        </p>
      ) : sub ? (
        <p className="muted mt-2 text-xs font-medium">{sub}</p>
      ) : null}
    </div>
  );
}

// Günlər üzrə iş sayı: sütunlar (≤ 24px, 4px yuvarlaq üst, bazaya bitişik), hairline şəbəkə, hover/fokusda dəqiq dəyər
function DayChart({ y, m, counts, todayDay }: { y: number; m: number; counts: number[]; todayDay: number | null }) {
  const max = Math.max(0, ...counts);
  const top = niceTop(max * 1.15); // ən hündür sütunun üstündə rəqəm üçün boşluq
  const step = top <= 4 ? 1 : top / 2;
  const ticks = [] as number[];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  const peak = max > 0 ? counts.indexOf(max) : -1; // yalnız ən yüksək sütunun üstündə rəqəm (hər nöqtəyə yox)

  return (
    <div className="flex gap-2">
      {/* Y oxu etiketləri */}
      <div className="relative h-48 w-6 shrink-0 text-right text-[11px] tabular-nums text-muted" aria-hidden="true">
        {ticks.map((v) => (
          <span key={v} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(v / top) * 100}%` }}>{v}</span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative h-48">
          {/* Şəbəkə: bir pillə səthdən tünd, nazik, düz xətt */}
          {ticks.map((v) => (
            <div key={v} className={`absolute inset-x-0 border-t ${v === 0 ? "border-[#c9d0dc]" : "border-line"}`} style={{ bottom: `${(v / top) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end">
            {counts.map((c, i) => {
              const day = i + 1;
              const wd = WEEKDAYS[new Date(y, m, day).getDay()];
              const align = i < counts.length / 3 ? "left-0" : i > (counts.length * 2) / 3 ? "right-0" : "left-1/2 -translate-x-1/2";
              return (
                <div key={day} tabIndex={0} aria-label={`${day} ${MONTHS[m].toLowerCase()}, ${wd}: ${c} iş`}
                  className="group relative flex h-full flex-1 items-end justify-center rounded-md outline-none hover:bg-primary-soft/60 focus-visible:bg-primary-soft/60">
                  {c > 0 && (
                    <div className="w-full max-w-[18px] rounded-t-[4px] bg-primary transition-colors group-hover:bg-primary-dark group-focus-visible:bg-primary-dark"
                      style={{ height: `${(c / top) * 100}%` }} />
                  )}
                  {i === peak && (
                    <span className="pointer-events-none absolute -translate-y-1 text-[11px] font-bold tabular-nums" style={{ bottom: `${(c / top) * 100}%` }}>{c}</span>
                  )}
                  {/* Tooltip yalnız iş olan günlərdə, sütunun üstündə: dəyər birinci (qalın), tarix ikinci */}
                  {c > 0 && (
                    <div role="tooltip" style={{ bottom: `calc(${(c / top) * 100}% + 20px)` }}
                      className={`pointer-events-none absolute z-10 hidden whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-[0_8px_24px_rgba(16,24,40,0.14)] group-hover:block group-focus-visible:block ${align}`}>
                      <p className="font-bold">{c} iş</p>
                      <p className="muted">{day} {MONTHS[m].toLowerCase()}, {wd}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* X oxu: günlər; gələcək günlər solğun */}
        <div className="mt-1.5 flex" aria-hidden="true">
          {counts.map((_, i) => (
            <span key={i} className={`flex-1 text-center text-[10px] tabular-nums ${todayDay !== null && i + 1 > todayDay ? "text-line" : "text-muted"}`}>{i + 1}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Aylıq statistika: öz işlərim (iş sayı, gün, yer), günlər üzrə qrafik, ən çox işlənən yerlər
export function MonthStats() {
  const [today] = useState(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
  });
  const [ym, setYm] = useState({ y: today.y, m: today.m });
  const [me, setMe] = useState<number | null | undefined>(undefined); // undefined = yüklənir, null = əməkdaş kartı yoxdur
  const [data, setData] = useState<MonthData | null>(null);
  const [table, setTable] = useState(false);
  const key = `${ym.y}-${ym.m}`;

  useEffect(() => {
    let cancelled = false;
    createClient().rpc("my_employee_id").then(({ data: id }) => {
      if (!cancelled) setMe(id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    fetchMonth(me, ym.y, ym.m, today).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true; // ay tez-tez dəyişəndə köhnə cavab yenisinin üstünə yazılmasın
    };
  }, [me, ym, today]);

  const days = new Date(ym.y, ym.m + 1, 0).getDate();
  const isCurrent = ym.y === today.y && ym.m === today.m;

  const stats = useMemo(() => {
    const counts = Array<number>(days).fill(0);
    const places = new Map<string, { label: string; n: number }>();
    for (const l of data?.logs ?? []) {
      const d = Number(l.work_date.slice(8, 10));
      if (d >= 1 && d <= days) counts[d - 1] += 1;
      const p = placeOf(l);
      const e = places.get(p.key) ?? { label: p.label, n: 0 };
      e.n += 1;
      places.set(p.key, e);
    }
    const total = counts.reduce((a, b) => a + b, 0);
    const active = counts.filter((c) => c > 0).length;
    const top = [...places.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, "az")).slice(0, 5);
    return { counts, total, active, placeCount: places.size, top };
  }, [data, days]);

  if (me === null) {
    return <div className="card muted py-10 text-center text-sm">Hesabın əməkdaş kartına bağlı deyil, ona görə şəxsi statistika yoxdur.</div>;
  }

  const loading = me === undefined || !data || data.key !== key;
  const prevMonth = () => setYm((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const nextMonth = () => setYm((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));
  const maxPlace = stats.top[0]?.n ?? 1;

  return (
    <div className="space-y-5">
      {/* Filtr bir sətirdə, məzmunun üstündə: ay seçimi */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={prevMonth} className="icon-btn" aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
        <h2 className="min-w-40 text-center text-lg font-bold">{MONTHS[ym.m]} {ym.y}</h2>
        <button type="button" onClick={nextMonth} disabled={isCurrent} className="icon-btn" aria-label="Sonrakı ay"><ChevronRight size={18} /></button>
        {!isCurrent && (
          <button type="button" onClick={() => setYm({ y: today.y, m: today.m })} className="btn btn-soft btn-sm ml-2">Bu ay</button>
        )}
      </div>

      {/* Yenilənəndə çərçivə qalır, məzmun solğunlaşır (skelet və tullanma yox) */}
      <div className={`space-y-5 transition-opacity ${loading && data ? "opacity-60" : ""}`}>
        {!data ? (
          <div className="card muted text-sm">Yüklənir...</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-5">
              <Kpi icon={ClipboardList} label="İş sayı" value={String(stats.total)} delta={{ diff: stats.total - data.prevCount, text: data.prevLabel }} />
              <Kpi icon={CalendarCheck} label="İş görülən gün" value={String(stats.active)} sub={`ayın ${isCurrent ? `${today.d} günündən` : `${days} günündən`}`} />
              <Kpi icon={MapPin} label="Fərqli yer" value={String(stats.placeCount)} sub="şirkət, filial, mağaza" />
            </div>

            <div className="grid grid-cols-[1.7fr_1fr] gap-5">
            <section className="card">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="card-title flex items-center gap-2"><BarChart3 size={18} className="text-primary" /> Günlər üzrə iş sayı</h3>
                <button type="button" onClick={() => setTable((t) => !t)} className="btn btn-soft btn-sm" aria-pressed={table}>
                  <Table2 size={14} /> {table ? "Qrafik" : "Cədvəl"}
                </button>
              </div>
              {table ? (
                stats.total === 0 ? (
                  <p className="muted py-6 text-center text-sm">Bu ayda iş qeydi yoxdur.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs font-semibold text-muted">
                      <tr><th className="py-2">Gün</th><th className="py-2 text-right">İş sayı</th></tr>
                    </thead>
                    <tbody>
                      {stats.counts.map((c, i) => c > 0 && (
                        <tr key={i} className="border-t border-line">
                          <td className="py-2">{i + 1} {MONTHS[ym.m].toLowerCase()}, {WEEKDAYS[new Date(ym.y, ym.m, i + 1).getDay()]}</td>
                          <td className="py-2 text-right font-semibold tabular-nums">{c}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-line font-bold"><td className="py-2">Cəmi</td><td className="py-2 text-right tabular-nums">{stats.total}</td></tr>
                    </tbody>
                  </table>
                )
              ) : (
                <>
                  <DayChart y={ym.y} m={ym.m} counts={stats.counts} todayDay={isCurrent ? today.d : null} />
                  {stats.total === 0 && <p className="muted mt-3 text-center text-sm">Bu ayda iş qeydi yoxdur.</p>}
                </>
              )}
            </section>

            <section className="card">
              <h3 className="card-title mb-4 flex items-center gap-2"><MapPin size={18} className="text-primary" /> Ən çox işlənən yerlər</h3>
              {stats.top.length === 0 ? (
                <p className="muted py-4 text-center text-sm">Bu ayda iş qeydi yoxdur.</p>
              ) : (
                <ul className="space-y-4">
                  {stats.top.map((p, i) => (
                    <li key={p.label}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-baseline gap-2">
                          <span className="w-4 shrink-0 text-xs font-bold tabular-nums text-muted">{i + 1}</span>
                          <span className="min-w-0 truncate font-medium" title={p.label}>{p.label}</span>
                        </span>
                        <span className="shrink-0 font-bold tabular-nums">{p.n} iş</span>
                      </div>
                      {/* Nazik zolaq: qalınlıq 8px, yuvarlaq, bir hue; iz bir pillə açıq */}
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-primary-soft">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(p.n / maxPlace) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
