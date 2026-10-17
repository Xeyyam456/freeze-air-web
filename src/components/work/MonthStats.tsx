"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Sparkles, Table2, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const WEEKDAYS = ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"];
const WEEKDAYS_SHORT = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"]; // həftə bazar ertəsindən

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

type LogRow = {
  id: number;
  work_date: string;
  place_text: string | null;
  stores: { name: string; companies: { name: string } | null } | null;
  companies: { name: string } | null;
};

type MonthData = { key: string; logs: LogRow[]; prevCount: number };

// Seçilmiş ayın işləri + müqayisə üçün əvvəlki ayın sayı. Müqayisə həmişə əvvəlki ayın 1-dən sonuna qədər tam sayı ilədir
// (istifadəçi qərarı: "keçən ayın eyni günündən yox, hər ayın 1-dən sonuna qədər").
async function fetchMonth(employeeId: number, y: number, m: number): Promise<MonthData> {
  const supabase = createClient();
  const days = new Date(y, m + 1, 0).getDate();
  const py = m === 0 ? y - 1 : y;
  const pm = m === 0 ? 11 : m - 1;
  const pdays = new Date(py, pm + 1, 0).getDate();
  const [cur, prev] = await Promise.all([
    supabase.from("work_logs")
      .select("id, work_date, place_text, stores(name, companies(name)), companies(name)")
      .eq("employee_id", employeeId).gte("work_date", iso(y, m, 1)).lte("work_date", iso(y, m, days)),
    supabase.from("work_logs").select("id", { count: "exact", head: true })
      .eq("employee_id", employeeId).gte("work_date", iso(py, pm, 1)).lte("work_date", iso(py, pm, pdays)),
  ]);
  return { key: `${y}-${m}`, logs: (cur.data ?? []) as LogRow[], prevCount: prev.count ?? 0 };
}

// İş yeri: mağaza/filial (şirkətin adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer
function placeOf(l: LogRow) {
  if (l.stores) return { key: `s:${l.stores.companies?.name}:${l.stores.name}`, label: `${l.stores.companies?.name ?? ""} · ${l.stores.name}` };
  if (l.companies) return { key: `c:${l.companies.name}`, label: l.companies.name };
  const t = l.place_text ?? "—";
  return { key: `t:${t}`, label: t };
}

// Y oxu: yuvarlaq, az xətt
function niceTop(max: number) {
  const step = [1, 2, 5, 10, 20, 50].find((s) => max / s <= 4) ?? 100;
  return Math.max(step, Math.ceil(max / step) * step);
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));

// Hamar əyri (Catmull-Rom → Bézier); koordinatlar faizlə (0..100), əyri sahədən kənara çıxmır
function smoothPath(pts: [number, number][]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1y = clamp(p1[1] + (p2[1] - p0[1]) / 6);
    const c2y = clamp(p2[1] - (p3[1] - p1[1]) / 6);
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${c1y}, ${p2[0] - (p3[0] - p1[0]) / 6} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// Hero kartın içindəki əyri: ağ parlayan xətt, şəffaf ağ dolğu; hover/fokusda şaquli xətt, nöqtə və tooltip
function HeroChart({ y, m, series, todayDay, cumulative }: { y: number; m: number; series: number[]; todayDay: number | null; cumulative: boolean }) {
  const days = series.length;
  const shown = todayDay ?? days; // cari ayda gələcək günlər çəkilmir
  const values = useMemo(() => {
    const raw = series.slice(0, shown);
    if (!cumulative) return raw;
    let acc = 0;
    return raw.map((v) => (acc += v));
  }, [series, shown, cumulative]);
  const max = Math.max(0, ...values);
  const top = niceTop(max * 1.15);
  const xOf = (i: number) => ((i + 0.5) / days) * 100;
  const yOf = (v: number) => 100 - (v / top) * 100;
  const pts = values.map((v, i) => [xOf(i), yOf(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = pts.length > 1 ? `${line} L ${pts[pts.length - 1][0]} 100 L ${pts[0][0]} 100 Z` : "";
  const [hover, setHover] = useState<number | null>(null);
  const peak = cumulative ? values.length - 1 : max > 0 ? values.indexOf(max) : -1;

  return (
    <div>
      <div className="relative h-44" onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((t) => <div key={t} className={`absolute inset-x-0 border-t ${t === 0 ? "border-white/40" : "border-white/15"}`} style={{ bottom: `${t * 100}%` }} />)}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="ms-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {area && <path d={area} fill="url(#ms-fill)" />}
          {line && <path d={line} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0 2px 8px rgba(10,26,51,0.35))" }} />}
        </svg>
        {peak >= 0 && values[peak] > 0 && hover === null && (
          <span className="pointer-events-none absolute grid h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_2px_10px_rgba(10,26,51,0.4)]"
            style={{ left: `${xOf(peak)}%`, top: `${yOf(values[peak])}%` }}>
            <span className="absolute -top-6 text-xs font-bold tabular-nums text-white">{values[peak]}</span>
          </span>
        )}
        <div className="absolute inset-0 flex">
          {Array.from({ length: days }, (_, i) => {
            const day = i + 1;
            const disabled = i >= shown;
            const wd = WEEKDAYS[new Date(y, m, day).getDay()];
            const align = i < days / 3 ? "left-0" : i > (days * 2) / 3 ? "right-0" : "left-1/2 -translate-x-1/2";
            return (
              <div key={day} tabIndex={disabled ? -1 : 0} onMouseEnter={() => !disabled && setHover(i)} onFocus={() => !disabled && setHover(i)} onBlur={() => setHover(null)}
                aria-label={disabled ? undefined : `${day} ${MONTHS[m].toLowerCase()}, ${wd}: ${series[i]} iş`}
                className="relative h-full flex-1 outline-none">
                {hover === i && !disabled && (
                  <>
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/60" />
                    <span className="pointer-events-none absolute left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_12px_rgba(10,26,51,0.45)] ring-4 ring-white/30"
                      style={{ top: `${yOf(values[i])}%` }} />
                    <div role="tooltip" style={{ bottom: `calc(${(values[i] / top) * 100}% + 20px)` }}
                      className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs text-ink shadow-[0_12px_32px_rgba(10,26,51,0.3)] ${align}`}>
                      <p className="text-sm font-bold">{series[i]} iş{cumulative && <span className="font-medium text-muted"> · yığım {values[i]}</span>}</p>
                      <p className="text-muted">{day} {MONTHS[m].toLowerCase()}, {wd}</p>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex" aria-hidden="true">
        {Array.from({ length: days }, (_, i) => (
          <span key={i} className={`flex-1 text-center text-[10px] tabular-nums ${i >= shown ? "text-white/30" : "text-white/75"}`}>{(i + 1) % 2 === 1 || days <= 16 ? i + 1 : ""}</span>
        ))}
      </div>
    </div>
  );
}

// Kalendar istilik xəritəsi: ayın hər günü bir xana, iş sayına görə rənglənir (az → çox). Bugün halqa ilə.
function Heatmap({ y, m, counts, todayDay }: { y: number; m: number; counts: number[]; todayDay: number | null }) {
  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // bazar ertəsi = 0
  const max = Math.max(1, ...counts);
  const level = (c: number) => (c === 0 ? 0 : Math.min(4, Math.ceil((c / max) * 4)));
  const cell = [
    "bg-bg text-muted",
    "bg-primary/25 text-primary-dark",
    "bg-primary/50 text-primary-dark",
    "bg-primary/75 text-white",
    "bg-gradient-to-br from-primary to-frost text-white shadow-[0_4px_12px_rgba(31,111,235,0.35)]",
  ];
  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-muted">
        {WEEKDAYS_SHORT.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
        {counts.map((c, i) => {
          const day = i + 1;
          const future = todayDay !== null && day > todayDay;
          const wd = WEEKDAYS[new Date(y, m, day).getDay()];
          return (
            <div key={day} tabIndex={0} aria-label={`${day} ${MONTHS[m].toLowerCase()}, ${wd}: ${c} iş`}
              className={`group relative grid h-11 place-items-center rounded-xl text-sm font-bold tabular-nums outline-none transition-transform hover:scale-105 focus-visible:scale-105 ${future ? "bg-bg/50 text-line" : cell[level(c)]} ${todayDay === day ? "ring-2 ring-ink/70 ring-offset-2" : ""}`}>
              {day}
              {!future && (
                <span role="tooltip" className="pointer-events-none absolute bottom-full z-10 mb-1.5 hidden whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg group-hover:block group-focus-visible:block">
                  {c} iş · {day} {MONTHS[m].toLowerCase()}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[11px] font-medium text-muted" aria-hidden="true">
        az {cell.map((c, i) => <span key={i} className={`h-3.5 w-3.5 rounded-md ${c.split(" ")[0]} ${i === 4 ? "bg-gradient-to-br from-primary to-frost" : ""}`} />)} çox
      </div>
    </div>
  );
}

// Aylıq statistika (usta paneli): öz işlərim. Parlaq mavi hero kart (iri rəqəm + əyri), kalendar istilik xəritəsi, ən çox işlənən yerlər.
export function MonthStats() {
  const [today] = useState(() => {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
  });
  const [ym, setYm] = useState({ y: today.y, m: today.m });
  const [me, setMe] = useState<number | null | undefined>(undefined); // undefined = yüklənir, null = əməkdaş kartı yoxdur
  const [data, setData] = useState<MonthData | null>(null);
  const [cumulative, setCumulative] = useState(false);
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
    fetchMonth(me, ym.y, ym.m).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true; // ay tez-tez dəyişəndə köhnə cavab yenisinin üstünə yazılmasın
    };
  }, [me, ym]);

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
  const diff = data ? stats.total - data.prevCount : 0;
  const seg = (on: boolean) => `rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${on ? "bg-white text-primary shadow-sm" : "text-white/80 hover:text-white"}`;
  const navBtn = "grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25 disabled:opacity-40 disabled:hover:bg-white/15";

  return (
    <div className="space-y-5">
      {/* Yenilənəndə çərçivə qalır, məzmun solğunlaşır (skelet və tullanma yox) */}
      <div className={`space-y-5 transition-opacity ${loading && data ? "opacity-60" : ""}`}>
        {/* Hero: parlaq mavi→firuzəyi kart */}
        <section className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(120deg,#1f6feb,#1a8fe0_55%,#22c3e6)] p-6 text-white shadow-[0_20px_50px_rgba(31,111,235,0.35)]">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#0a1a33]/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-white/85"><Sparkles size={15} /> {MONTHS[ym.m]} {ym.y}</p>
                <div className="mt-1 flex items-end gap-3">
                  <span className="text-7xl font-extrabold leading-none tracking-tight">{data ? stats.total : "…"}</span>
                  <span className="pb-2 text-lg font-semibold text-white/85">iş</span>
                </div>
                {data && (
                  <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${diff < 0 ? "bg-rose-500/35" : "bg-white/20"}`}>
                    {diff > 0 ? <TrendingUp size={13} /> : diff < 0 ? <TrendingDown size={13} /> : null}
                    {diff > 0 ? `+${diff}` : diff < 0 ? `−${Math.abs(diff)}` : "Eyni"} <span className="font-medium text-white/80">əvvəlki aya görə</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={prevMonth} className={navBtn} aria-label="Əvvəlki ay"><ChevronLeft size={18} /></button>
                  <button type="button" onClick={nextMonth} disabled={isCurrent} className={navBtn} aria-label="Sonrakı ay"><ChevronRight size={18} /></button>
                  {!isCurrent && (
                    <button type="button" onClick={() => setYm({ y: today.y, m: today.m })} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary">Bu ay</button>
                  )}
                </div>
                <div className="flex gap-3">
                  <div className="rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur">
                    <p className="text-[11px] font-semibold text-white/75">İş görülən gün</p>
                    <p className="text-2xl font-extrabold leading-tight">{stats.active}<span className="text-sm font-semibold text-white/70"> / {isCurrent ? today.d : days}</span></p>
                  </div>
                  <div className="rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur">
                    <p className="text-[11px] font-semibold text-white/75">Fərqli yer</p>
                    <p className="text-2xl font-extrabold leading-tight">{stats.placeCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="inline-flex gap-0.5 rounded-xl bg-white/15 p-1" role="tablist" aria-label="Rejim">
                <button type="button" role="tab" aria-selected={!cumulative} onClick={() => setCumulative(false)} className={seg(!cumulative)}>Günlük</button>
                <button type="button" role="tab" aria-selected={cumulative} onClick={() => setCumulative(true)} className={seg(cumulative)}>Yığım</button>
              </div>
              <button type="button" onClick={() => setTable((t) => !t)} aria-pressed={table}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/25">
                <Table2 size={14} /> {table ? "Qrafik" : "Cədvəl"}
              </button>
            </div>

            <div className="mt-4">
              {table ? (
                stats.total === 0 ? <p className="py-8 text-center text-sm text-white/85">Bu ayda iş qeydi yoxdur.</p> : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs font-semibold text-white/70"><tr><th className="py-2">Gün</th><th className="py-2 text-right">İş sayı</th></tr></thead>
                    <tbody>
                      {stats.counts.map((c, i) => c > 0 && (
                        <tr key={i} className="border-t border-white/20">
                          <td className="py-2">{i + 1} {MONTHS[ym.m].toLowerCase()}, {WEEKDAYS[new Date(ym.y, ym.m, i + 1).getDay()]}</td>
                          <td className="py-2 text-right font-bold tabular-nums">{c}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-white/30 font-extrabold"><td className="py-2">Cəmi</td><td className="py-2 text-right tabular-nums">{stats.total}</td></tr>
                    </tbody>
                  </table>
                )
              ) : (
                <>
                  <HeroChart y={ym.y} m={ym.m} series={stats.counts} todayDay={isCurrent ? today.d : null} cumulative={cumulative} />
                  {data && stats.total === 0 && <p className="mt-3 text-center text-sm text-white/85">Bu ayda iş qeydi yoxdur.</p>}
                </>
              )}
            </div>
          </div>
        </section>

        {data && (
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <section className="card">
              <h3 className="card-title mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-primary" /> Ayın kalendarı</h3>
              <Heatmap y={ym.y} m={ym.m} counts={stats.counts} todayDay={isCurrent ? today.d : null} />
            </section>

            <section className="card">
              <h3 className="card-title mb-4 flex items-center gap-2"><Trophy size={18} className="text-primary" /> Ən çox işlənən yerlər</h3>
              {stats.top.length === 0 ? (
                <p className="muted py-8 text-center text-sm">Bu ayda iş qeydi yoxdur.</p>
              ) : (
                <ul className="space-y-4">
                  {stats.top.map((p, i) => (
                    <li key={p.label}>
                      <div className="flex items-center gap-3">
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${i === 0 ? "bg-gradient-to-br from-primary to-frost text-white shadow-[0_4px_10px_rgba(31,111,235,0.35)]" : "bg-bg text-muted"}`}>{i + 1}</span>
                        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold"><MapPin size={13} className="shrink-0 text-primary" /><span className="truncate" title={p.label}>{p.label}</span></span>
                        <span className="shrink-0 text-sm font-extrabold tabular-nums">{p.n}<span className="text-xs font-semibold text-muted"> iş</span></span>
                      </div>
                      <div className="ml-10 mt-2 h-2 overflow-hidden rounded-full bg-primary-soft">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-frost" style={{ width: `${(p.n / maxPlace) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
