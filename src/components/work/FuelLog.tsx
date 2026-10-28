"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, FileSpreadsheet, Fuel, Gauge, HandCoins, ImageIcon, Moon, Pencil, Route, Sun, X } from "lucide-react";
import { MONTHS_AZ, todayBaku } from "@/lib/attendance";
import { createClient } from "@/lib/supabase/client";
import { getQueryClient } from "@/lib/queryClient";
import { useData } from "@/lib/useData";
import type { Tables } from "@/types/database";
import { toast } from "@/lib/toast";
import { exportFuel } from "@/lib/export-fuel";

type Row = Tables<"mileage_logs">;
type Car = { car_plate: string | null; car_model: string | null; fuel_per_100: number | null; fuel_type: string | null };
const FUEL_LABEL: Record<string, string> = { petrol: "Benzin", diesel: "Dizel" }; // 0079

const azn = (n: number) => `${n.toFixed(2)} ₼`;
const timeBaku = (iso: string) =>
  new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

// Şəkli kiçilt (ən uzun tərəf 1600px), WebP: spidometr oxunaqlı qalır, yükləmə yüngül olur
async function toWebp(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error("Şəkil çevrilmədi"))), "image/webp", 0.85));
}

// Qapalı bucket-dəki şəkil: imzalı link (1 saat)
function useSigned(path: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    createClient().storage.from("mileage").createSignedUrl(path, 3600).then(({ data }) => { if (!cancelled) setUrl(data?.signedUrl ?? null); });
    return () => { cancelled = true; };
  }, [path]);
  return path ? url : null;
}

function Photo({ path, alt }: { path: string | null; alt: string }) {
  const url = useSigned(path);
  if (!path) return <span className="grid h-16 w-24 shrink-0 place-items-center rounded-lg bg-bg text-muted"><ImageIcon size={18} /></span>;
  return url ? (
    <a href={url} target="_blank" rel="noreferrer" className="shrink-0" title="Şəkli böyüt">
      {/* eslint-disable-next-line @next/next/no-img-element -- imzalı link, optimizasiyaya ehtiyac yoxdur */}
      <img src={url} alt={alt} className="h-16 w-24 rounded-lg object-cover ring-1 ring-line" />
    </a>
  ) : <span className="h-16 w-24 shrink-0 animate-pulse rounded-lg bg-bg" />;
}

// Səhər / axşam addımı: şəkil + km; yazılıbsa göstərir, bu gün ərzində "Dəyiş" ilə düzəlmək olur
function Step({ kind, value, photo, at, min, max, disabled, onSave }: {
  kind: "start" | "end";
  value: number | null;
  photo: string | null;
  at: string | null;
  min?: number;
  max?: number;
  disabled?: boolean;
  onSave: (km: number, file: File | null) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [km, setKm] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const done = value !== null && !editing;
  const Icon = kind === "start" ? Sun : Moon;
  const title = kind === "start" ? "Səhər: işə başlayanda" : "Axşam: işi bitirəndə";

  function pick(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(km.replace(/\s/g, ""));
    if (!km || !Number.isInteger(n) || n < 0) return toast.error("Km-i tam rəqəmlə yaz.");
    if (min !== undefined && n < min) return toast.error("Axşam km səhər km-dən az ola bilməz.", `Səhər km: ${min.toLocaleString("az")}. Daha böyük rəqəm yaz.`);
    if (max !== undefined && n > max) return toast.error("Səhər km axşam km-dən çox ola bilməz.", `Axşam km: ${max.toLocaleString("az")}. Daha kiçik rəqəm yaz və ya əvvəl axşam km-ni düzəlt.`);
    if (!file && !photo) return toast.error("Spidometrin şəklini çək.");
    setPending(true);
    const ok = await onSave(n, file);
    setPending(false);
    if (ok) { setEditing(false); setKm(""); pick(null); }
  }

  return (
    <section className={`card flex min-w-0 grow basis-[340px] flex-col gap-3 !p-4 max-sm:basis-full max-sm:gap-2 max-sm:!p-3 ${disabled ? "opacity-60" : ""}`}>
      <header className="flex items-center gap-2.5 max-sm:gap-2">
        <span className={`grid h-9 w-9 max-sm:h-7 max-sm:w-7 shrink-0 place-items-center rounded-xl ${done ? "bg-ok-soft text-ok" : "bg-primary-soft text-primary"}`}>
          {done ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold max-sm:text-sm">{title}</span>
          <span className="muted block truncate text-xs max-sm:text-[11px]">{done && at ? `Yazılıb: ${timeBaku(at)}` : disabled ? "Əvvəl səhər km-ini yaz" : "Spidometrin şəkli + km"}</span>
        </span>
        {done && !disabled && (
          <button type="button" onClick={() => { setEditing(true); setKm(String(value)); }} className="btn btn-soft btn-sm max-sm:!h-7 max-sm:!px-2.5" aria-label="Dəyiş"><Pencil size={13} /> Dəyiş</button>
        )}
      </header>

      {done ? (
        <div className="flex items-center gap-3">
          <Photo path={photo} alt={title} />
          <p className="text-2xl font-extrabold tabular-nums max-sm:text-xl">{value!.toLocaleString("az")} <span className="muted text-sm font-semibold">km</span></p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3 max-sm:gap-2">
          <label className={`grid h-16 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border-2 border-dashed ${
            preview || photo ? "border-primary" : "border-line hover:border-primary"} ${disabled ? "pointer-events-none" : ""}`} title="Şəkil çək və ya seç">
            {preview
              // eslint-disable-next-line @next/next/no-img-element -- yerli önizləmə
              ? <img src={preview} alt="Önizləmə" className="h-full w-full object-cover" />
              : <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-primary"><Camera size={18} /> Şəkil</span>}
            {/* capture yoxdur: telefon "Kamera / Qalereya" seçimini özü təklif edir */}
            <input type="file" accept="image/*" className="sr-only" disabled={disabled}
              onChange={(e) => pick(e.target.files?.[0] ?? null)} />
          </label>
          <label className="min-w-[140px] flex-1">
            <span className="label">Spidometr (km)</span>
            <input value={km} onChange={(e) => setKm(e.target.value.replace(/[^\d\s]/g, ""))} inputMode="numeric" disabled={disabled}
              placeholder={min !== undefined ? `≥ ${min}` : "məs. 52 000"} className="field tabular-nums" />
          </label>
          <div className="flex gap-2 max-xl:w-full max-xl:[&>button]:flex-1">
            {editing && <button type="button" onClick={() => { setEditing(false); pick(null); }} className="btn btn-soft">Ləğv et</button>}
            <button type="submit" disabled={pending || disabled} className="btn btn-primary">{pending ? "..." : "Yadda saxla"}</button>
          </div>
        </form>
      )}
    </section>
  );
}

// "Aldığım yanacaq pulu": ay boyu hər gün ödəniş ola bilər, ona görə yığcam kart: üstdə yekun, gözləyənlər həmişə görünür (təsdiq lazımdır),
// qəbul olunanların son 3-ü; "Hamısına bax" günlərə görə qruplaşmış sürüşən siyahı açır (hər günün başlığında günün cəmi)
function PaymentsCard({ payments, onConfirm }: { payments: Payment[]; onConfirm: (p: Payment, received: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const waiting = payments.filter((p) => p.status !== "received");
  const received = payments.filter((p) => p.status === "received");
  const sum = (l: Payment[]) => l.reduce((n, p) => n + Number(p.amount), 0);
  const preview = received.slice(0, Math.max(1, 3 - waiting.length));
  const hidden = received.length - preview.length;
  const days = new Map<string, Payment[]>();
  for (const p of received) days.set(p.day, [...(days.get(p.day) ?? []), p]);

  return (
    <div className="card overflow-hidden !p-0">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-[linear-gradient(135deg,#ecfbf1,#ffffff)] px-4 py-3 max-sm:px-3 max-sm:py-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Cəmi aldığın</p>
          <p className="text-2xl font-extrabold tabular-nums leading-tight text-ok max-sm:text-xl">{azn(sum(received))}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5 text-xs font-semibold max-sm:text-[11px]">
          <span className="whitespace-nowrap rounded-full bg-bg px-2.5 py-1 text-muted">{payments.length} ödəniş</span>
          {waiting.length > 0 && <span className="whitespace-nowrap rounded-full bg-[#fff6e5] px-2.5 py-1 text-amber-700">{waiting.length} gözləyir · {azn(sum(waiting))}</span>}
        </div>
      </div>
      {waiting.length > 0 && (
        <ul className="divide-y divide-line border-b border-line bg-[#fffdf7]">
          {waiting.map((p) => <PaymentRow key={p.id} p={p} onConfirm={(r) => onConfirm(p, r)} />)}
        </ul>
      )}
      {!open ? (
        <ul className="divide-y divide-line">
          {preview.map((p) => <PaymentRow key={p.id} p={p} onConfirm={(r) => onConfirm(p, r)} />)}
        </ul>
      ) : (
        <div className="nice-scroll max-h-[340px] overflow-y-auto">
          {[...days].map(([day, list]) => (
            <div key={day}>
              <p className="sticky top-0 z-10 flex items-center justify-between bg-bg px-4 py-1.5 text-xs font-semibold text-muted max-sm:px-3">
                <span>{dayName(day)}</span><span className="tabular-nums">{list.length > 1 ? `${list.length} ödəniş · ` : ""}{azn(sum(list))}</span>
              </p>
              <ul className="divide-y divide-line">{list.map((p) => <PaymentRow key={p.id} p={p} hideDay onConfirm={(r) => onConfirm(p, r)} />)}</ul>
            </div>
          ))}
        </div>
      )}
      {(hidden > 0 || open) && received.length > 0 && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
          className="flex w-full items-center justify-center gap-1.5 border-t border-line bg-[#f8fafc] py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft/40">
          {open ? "Yığ" : `Hamısına bax (${received.length})`}
          <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}

type Period = "day" | "week" | "month";
// Bazanın ingiliscə xətalarını başa düşülən Azərbaycan dilinə çevirir
function fuelError(msg: string, kind: "start" | "end") {
  if (/mileage_logs_check/.test(msg)) return kind === "start" ? "Səhər km axşam km-dən çox ola bilməz." : "Axşam km səhər km-dən az ola bilməz.";
  if (/mileage_logs_(start|end)_km_check/.test(msg)) return "Km mənfi ola bilməz.";
  if (/mileage_logs_employee_id_day_key|duplicate key/.test(msg)) return "Bu gün üçün qeyd artıq var, səhifəni yenilə.";
  if (/row-level security|permission denied/.test(msg)) return "Bu əməliyyata icazən yoxdur.";
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return "İnternet bağlantısı yoxdur, yenidən yoxla.";
  return msg;
}

const PERIOD_LABEL: Record<Period, string> = { day: "Gün", week: "Həftə", month: "Ay" };
const PERIOD_TOTAL: Record<Period, string> = { day: "Günün yanacaq pulu", week: "Həftənin yanacaq pulu", month: "Ayın yanacaq pulu" };

// Tarix köməkçiləri ("YYYY-MM-DD", UTC günorta ilə: saat qurşağı sürüşməsin); admin Yanacaq səhifəsi ilə eyni
const d12 = (iso: string) => new Date(`${iso}T12:00:00Z`);
const isoOf = (d: Date) => d.toISOString().slice(0, 10);
function addDays(iso: string, n: number) { const d = d12(iso); d.setUTCDate(d.getUTCDate() + n); return isoOf(d); }
function addMonths(iso: string, n: number) { const d = d12(`${iso.slice(0, 7)}-01`); d.setUTCMonth(d.getUTCMonth() + n); return isoOf(d); }
const WEEKDAY_SHORT = ["Baz", "B.e", "Ç.a", "Çər", "C.a", "Cüm", "Şən"];
const dayName = (iso: string) => `${Number(iso.slice(8))} ${MONTHS_AZ[Number(iso.slice(5, 7)) - 1]}`;

// Dövrün aralığı və adı: gün; həftə = şirkətin iş həftəsi, 6 gün (bazar ertəsi – şənbə, bazar istirahət); ay.
// workdays: dövrdəki iş günlərinin sayı (bazarsız), "5 / 6 iş günü" yazmaq üçün
function rangeOf(period: Period, anchor: string) {
  if (period === "day") return { from: anchor, to: anchor, label: dayName(anchor), workdays: 1 };
  if (period === "week") {
    const from = addDays(anchor, -((d12(anchor).getUTCDay() + 6) % 7));
    const to = addDays(from, 5);
    const same = from.slice(5, 7) === to.slice(5, 7);
    return { from, to, label: same ? `${Number(from.slice(8))}–${dayName(to)}` : `${dayName(from)} – ${dayName(to)}`, workdays: 6 };
  }
  const from = `${anchor.slice(0, 7)}-01`;
  const to = addDays(addMonths(from, 1), -1);
  let workdays = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) if (d12(d).getUTCDay() !== 0) workdays++;
  return { from, to, label: `${MONTHS_AZ[Number(anchor.slice(5, 7)) - 1]} ${anchor.slice(0, 4)}`, workdays };
}

const sum = (rows: Row[]) => {
  const closed = rows.filter((r) => r.km !== null);
  return {
    km: closed.reduce((n, r) => n + (r.km ?? 0), 0),
    liters: closed.reduce((n, r) => n + Number(r.liters ?? 0), 0),
    cost: closed.reduce((n, r) => n + Number(r.cost ?? 0), 0),
    days: closed.length,
  };
};

// Dövrün yürüşləri, bu günün sətri (dövrdən asılı deyil) və hazırkı yanacaq qiymətləri
// mFrom..mTo: seçilmiş dövrün ayı — balans aylıq hesablanır ("hər ayın öz hesabı")
async function fetchRange(employeeId: number, from: string, to: string, today: string, mFrom: string, mTo: string) {
  const supabase = createClient();
  const [{ data }, { data: t }, { data: s }, { data: pays }, { data: allCost }, { data: allPaid }] = await Promise.all([
    supabase.from("mileage_logs").select("*").eq("employee_id", employeeId).gte("day", from).lte("day", to).order("day", { ascending: false }),
    supabase.from("mileage_logs").select("*").eq("employee_id", employeeId).eq("day", today).maybeSingle(),
    supabase.from("fuel_settings").select("petrol_price, diesel_price").eq("id", 1).maybeSingle(),
    // Şirkətin verdiyi yanacaq pulu (0080): dövrün siyahısı + ayın balansı (ayda alınan − ayda sərf)
    supabase.from("fuel_payments").select("*").eq("employee_id", employeeId).gte("day", from).lte("day", to).order("day", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("mileage_logs").select("cost").eq("employee_id", employeeId).gte("day", mFrom).lte("day", mTo).not("cost", "is", null),
    supabase.from("fuel_payments").select("amount").eq("employee_id", employeeId).gte("day", mFrom).lte("day", mTo),
  ]);
  const month = {
    cost: (allCost ?? []).reduce((n, r) => n + Number(r.cost), 0),
    paid: (allPaid ?? []).reduce((n, p) => n + Number(p.amount), 0),
  };
  return { rows: data ?? [], today: t ?? null, prices: { petrol: s?.petrol_price ?? null, diesel: s?.diesel_price ?? null }, payments: pays ?? [], month };
}
type Loaded = Awaited<ReturnType<typeof fetchRange>>;
type Payment = Tables<"fuel_payments">;

// Balans = alınan − sərf: mənfi → şirkət sənə borcludur, müsbət → artıq almısan
function balanceText(b: number) {
  const v = Math.round(b * 100) / 100;
  if (v < 0) return { tone: "debt", text: `Şirkət sənə ${azn(-v)} borcludur` } as const;
  if (v > 0) return { tone: "over", text: `${azn(v)} artıq almısan` } as const;
  return { tone: "even", text: "Hesab bağlıdır" } as const;
}
const BAL_CLS = { debt: "text-[#fb7185]", over: "text-amber-300", even: "text-[#4ade80]" } as const;

// Ödəniş: məbləğ, tarix, qeyd; "Aldım" / "Almadım" (fuel_payment_confirm). Cavab dəyişdirilə bilər.
function PaymentRow({ p, onConfirm, hideDay = false }: { p: Payment; onConfirm: (received: boolean) => void; hideDay?: boolean }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 max-sm:gap-x-2 max-sm:gap-y-2 max-sm:px-3 max-sm:py-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary max-sm:hidden"><HandCoins size={17} /></span>
      <span className="min-w-0 flex-[1_1_160px]">
        <span className="block font-bold tabular-nums"><span className="whitespace-nowrap">{azn(Number(p.amount))}</span> {!hideDay && <span className="muted whitespace-nowrap text-xs font-semibold">· {dayName(p.day)}</span>}</span>
        {p.note && <span className="muted line-clamp-2 text-xs max-sm:line-clamp-1" title={p.note}>{p.note}</span>}
      </span>
      {p.status === "received" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2.5 py-1 text-xs font-bold text-ok"><Check size={13} strokeWidth={3} /> Aldım</span>
      ) : p.status === "disputed" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-1 text-xs font-bold text-danger"><AlertTriangle size={13} /> Almadım</span>
      ) : null}
      {/* "Aldım" təsdiqindən sonra cavab dəyişmir (bazada da: 0081); "Almadım"dan sonra "Aldım" olar */}
      {p.status !== "received" && (
        // Telefonda düymələr alt sətirdə, bərabər enli
        <span className="flex gap-1.5 max-sm:w-full max-sm:[&>button]:!h-8 max-sm:[&>button]:flex-1">
          <button type="button" onClick={() => onConfirm(true)} className="btn btn-sm bg-ok text-white hover:brightness-110"><Check size={14} /> Aldım</button>
          {p.status !== "disputed" && (
            <button type="button" onClick={() => onConfirm(false)} className="btn btn-soft btn-sm text-danger"><X size={14} /> Almadım</button>
          )}
        </span>
      )}
    </li>
  );
}

// Yanacaq: bu günün səhər / axşam km-i (şəkil + rəqəm), avtomatik km, litr, məbləğ (0077-0079).
// Başlıqda həmişə BU GÜNÜN hesabatı + seçilmiş dövrün (gün / həftə / ay) yanacaq pulu ayrıca; cədvəl dövrə görə (admin ilə eyni).
export function FuelLog({ employeeId, car }: { employeeId: number; car: Car }) {
  const today = todayBaku();
  const [period, setPeriod] = useState<Period>("day");
  const [anchor, setAnchor] = useState(today);
  const range = rangeOf(period, anchor);
  const monthR = rangeOf("month", anchor); // balansın ayı
  // Keşdə: dövr dəyişəndə köhnə dövr yeni gələnə qədər qalır, səhifəyə qayıdanda dərhal görünür
  const data: Loaded | null = useData("fuel-log", () => fetchRange(employeeId, range.from, range.to, today, monthR.from, monthR.to),
    [employeeId, range.from, range.to, today, monthR.from, monthR.to]);
  // Yazıdan / canlı hadisədən sonra: keş təzələnənə qədər gözlənilir (km yazıb dərhal yeni rəqəmi görmək üçün)
  const load = useCallback(() => getQueryClient().invalidateQueries({ queryKey: ["fuel-log"] }), []);

  // Canlı (0080-0082): şirkət pul verəndə / dəyişəndə və admin yürüşü düzəldəndə səhifə özü yenilənir; yeni ödənişdə tost.
  // Kanal sessiya ilə qoşulur (yoxsa RLS hadisə göndərmir), yalnız bu ustanın sətirləri.
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) await supabase.realtime.setAuth(session.access_token);
      channel = supabase
        .channel(`fuel-${employeeId}-${Math.random().toString(36).slice(2)}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "fuel_payments", filter: `employee_id=eq.${employeeId}` }, (payload) => {
          void load();
          if (payload.eventType === "INSERT") {
            const p = payload.new as Payment;
            toast.success(`Şirkət yanacaq pulu verdi: ${azn(Number(p.amount))}`, "«Aldım» ilə təsdiqlə");
          }
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "mileage_logs", filter: `employee_id=eq.${employeeId}` }, () => void load())
        .subscribe();
    })();
    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [employeeId, load]);

  const prices = data?.prices ?? { petrol: null, diesel: null };
  // Maşının yanacaq növünün hazırkı qiyməti
  const price = car.fuel_type === "diesel" ? prices.diesel : car.fuel_type === "petrol" ? prices.petrol : null;
  const fuelName = car.fuel_type ? FUEL_LABEL[car.fuel_type] : null;
  const todayRow = data?.today ?? null;
  const rows = data?.rows ?? null;
  const total = useMemo(() => sum(rows ?? []), [rows]);
  const payments = data?.payments ?? [];
  const paid = payments.reduce((n, p) => n + Number(p.amount), 0);
  // Ayın balansı: gün / həftə seçilsə də ayın borcuna görə (300 ₼ ayda verilibsə günə baxanda "artıq almısan" yazılmır)
  const month = data?.month ?? { cost: 0, paid: 0 };
  const balance = month.paid - month.cost;

  async function confirm(p: Payment, received: boolean) {
    const { error } = await createClient().rpc("fuel_payment_confirm", { p_id: p.id, p_received: received });
    if (error) return toast.error(error.message);
    toast.success(received ? "Təsdiqlədin: pulu aldın" : "Bildirdin: pulu almamısan", received ? undefined : "Admin görəcək");
    await load();
  }

  const shift = (dir: 1 | -1) => setAnchor((x) => {
    const next = period === "day" ? addDays(x, dir) : period === "week" ? addDays(x, 7 * dir) : addMonths(x, dir);
    return next > today ? today : next;
  });
  const atEnd = range.to >= today;

  async function upload(kind: "start" | "end", file: File | null) {
    if (!file) return null;
    const path = `${employeeId}/${today}-${kind}-${crypto.randomUUID()}.webp`;
    const { error } = await createClient().storage.from("mileage").upload(path, await toWebp(file), { contentType: "image/webp" });
    if (error) throw new Error(error.message);
    return path;
  }

  async function save(kind: "start" | "end", km: number, file: File | null) {
    try {
      const supabase = createClient();
      const photo = await upload(kind, file);
      const { error } = kind === "start" && !todayRow
        ? await supabase.from("mileage_logs").insert({ employee_id: employeeId, start_km: km, start_photo: photo })
        : await supabase.from("mileage_logs").update(kind === "start"
          ? { start_km: km, ...(photo ? { start_photo: photo } : {}) }
          : { end_km: km, ...(photo ? { end_photo: photo } : {}) }).eq("id", todayRow!.id);
      if (error) throw new Error(fuelError(error.message, kind));
      toast.success(kind === "start" ? "Səhər km-i yazıldı" : "Axşam km-i yazıldı, gün hesablandı");
      await load();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Alınmadı");
      return false;
    }
  }

  const per100 = car.fuel_per_100;
  const live = todayRow?.km != null ? todayRow : null; // axşam km yazılıb: gün bağlıdır
  const tone = !todayRow ? "none" : todayRow.end_km == null ? "open" : "done";

  return (
    <div className="space-y-6">
      {/* Tünd başlıq sürüşmədə yerində qalır (istifadəçi istəyi): üst zolağın altına yapışır, üstündəki boşluğu fon örtür; aşağı hissə sürüşür */}
      <div className="lg:sticky lg:top-[var(--header-h)] lg:z-20 lg:-mx-2 lg:-mt-[var(--gap)] lg:bg-bg lg:px-2 lg:pb-1 lg:pt-[var(--gap)]">
        <section className="rounded-[18px] bg-[#0c1b36] bg-[radial-gradient(520px_220px_at_100%_0%,rgba(34,195,230,0.22),transparent_70%)] p-5 text-white max-sm:p-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 max-sm:gap-y-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 max-lg:w-full lg:flex-nowrap">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-frost max-sm:h-10 max-sm:w-10 max-sm:rounded-xl"><Fuel size={22} /></span>
              <div className="min-w-0 max-lg:flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-bold">{car.car_plate ? <span className="plate shrink-0">{car.car_plate}</span> : "Maşın"} <span>{car.car_model}</span></p>
                <p className="text-xs text-white/60 max-sm:hidden">
                  {fuelName ?? "yanacaq seçilməyib"} · {per100 ? `${per100} L / 100 km` : "sərf yazılmayıb"} · {price ? `${price} ₼ / L` : "qiymət yazılmayıb"}
                </p>
              </div>
              {/* Ustanın öz yanacaq hesabı: seçilmiş ayın Excel faylı (xülasə, gündəlik, ödənişlər, aylar) */}
              <button type="button" onClick={() => void exportFuel(employeeId, anchor.slice(0, 7))} title="Bu ayın yanacaq hesabını Excel fayla çıxar" aria-label="Excel"
                className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 max-lg:ml-auto max-sm:h-9 max-sm:px-2.5 lg:ml-4">
                <FileSpreadsheet size={16} className="text-[#4ade80]" /> <span className="max-sm:hidden">Excel</span>
              </button>
              <p className="basis-full whitespace-nowrap text-[11px] text-white/60 sm:hidden">
                {fuelName ?? "yanacaq seçilməyib"} · {per100 ? `${per100} L / 100 km` : "sərf yazılmayıb"} · {price ? `${price} ₼ / L` : "qiymət yazılmayıb"}
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2 max-lg:ml-0 max-lg:w-full max-lg:justify-between">
              <div className="flex gap-1 rounded-xl bg-white/10 p-1 max-sm:w-full max-sm:[&>button]:flex-1" role="tablist" aria-label="Dövr">
                {(["day", "week", "month"] as const).map((p) => (
                  <button key={p} type="button" role="tab" aria-selected={period === p} onClick={() => { setPeriod(p); setAnchor(today); }}
                    className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors max-sm:py-1 ${period === p ? "bg-white text-[#0c1b36]" : "text-white/70 hover:text-white"}`}>
                    {PERIOD_LABEL[p]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-white/10 px-1 py-1 max-sm:w-full max-sm:py-0.5 max-sm:justify-between sm:max-lg:min-w-60 sm:max-lg:justify-between">
                <button type="button" onClick={() => shift(-1)} className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Əvvəlki"><ChevronLeft size={16} /></button>
                <span className="flex min-w-32 items-center justify-center gap-1.5 text-sm font-semibold"><CalendarDays size={14} className="text-frost" /> {range.label}</span>
                <button type="button" onClick={() => shift(1)} disabled={atEnd} className="grid h-7 w-7 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Sonrakı"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
  
          <div className="mt-4 grid gap-3 max-sm:mt-2 max-sm:gap-2 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr]">
            {/* Bu günün hesabatı: dövr filtrindən asılı deyil */}
            <div className="flex flex-col rounded-2xl bg-white/[0.07] px-5 py-4 ring-1 ring-white/10 max-sm:flex-row max-sm:items-center max-sm:justify-between max-sm:gap-3 max-sm:rounded-xl max-sm:px-3 max-sm:py-2.5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60 max-sm:whitespace-nowrap max-sm:tracking-normal max-[360px]:text-[11px]">
                <span className={`h-2 w-2 shrink-0 rounded-full ${tone === "done" ? "bg-[#4ade80]" : tone === "open" ? "bg-amber-400" : "bg-white/30"}`} />
                <span>Bu gün<span className="max-[400px]:hidden"> · {dayName(today)}</span></span>
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-2 max-lg:hidden">
                <p className="text-3xl font-extrabold tabular-nums leading-none">{todayRow?.km ?? 0} <span className="text-base font-bold text-white/60">km</span></p>
                <p className="tabular-nums text-white/80">{todayRow?.liters != null ? `${Number(todayRow.liters).toFixed(2)} L` : "— L"}</p>
                <p className="text-2xl font-extrabold tabular-nums text-[#4ade80]">{todayRow?.cost != null ? azn(Number(todayRow.cost)) : "—"}</p>
              </div>
              <p className="flex shrink-0 items-baseline gap-2 tabular-nums sm:hidden">
                <b className="text-base font-extrabold">{todayRow?.km ?? 0} <span className="text-xs font-semibold text-white/60">km</span></b>
                <span className="text-xs text-white/60 max-[400px]:hidden">{todayRow?.liters != null ? `${Number(todayRow.liters).toFixed(2)} L` : "— L"}</span>
                <b className="text-base font-extrabold text-[#4ade80]">{todayRow?.cost != null ? azn(Number(todayRow.cost)) : "—"}</b>
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 max-sm:hidden lg:hidden">
                {([["Km", String(todayRow?.km ?? 0), ""], ["Litr", todayRow?.liters != null ? Number(todayRow.liters).toFixed(2) : "—", ""],
                  ["Məbləğ", todayRow?.cost != null ? azn(Number(todayRow.cost)) : "—", "text-[#4ade80]"]] as const).map(([l, v, c]) => (
                  <div key={l} className="rounded-xl bg-white/[0.07] px-3 py-2">
                    <p className="text-[11px] text-white/55">{l}</p>
                    <p className={`text-lg font-extrabold tabular-nums leading-tight ${c}`}>{v}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/60 max-sm:hidden sm:max-lg:mt-auto sm:max-lg:pt-2">
                {!todayRow ? "Bu gün hələ yazılmayıb: səhər spidometri yaz"
                  : todayRow.end_km == null ? `Açıqdır · səhər ${todayRow.start_km.toLocaleString("az")} km, axşam yaz`
                  : `${todayRow.start_km.toLocaleString("az")} → ${todayRow.end_km.toLocaleString("az")} km${todayRow.fuel_price != null ? ` · ${todayRow.fuel_price} ₼ / L` : ""}`}
              </p>
            </div>
            {/* Seçilmiş dövrün yanacaq pulu: sürülən km-ə görə; altda ayın balansı (0080: ayda alınan − ayda sərf) */}
            <div className="flex flex-col rounded-2xl bg-gradient-to-br from-frost/25 to-primary/30 px-5 py-4 ring-1 ring-frost/30 max-sm:rounded-xl max-sm:px-3 max-sm:py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70 max-sm:tracking-normal">{PERIOD_TOTAL[period]}<span className="max-lg:hidden"> · {range.label}</span></p>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 max-sm:mt-0.5">
                <p className="text-4xl font-extrabold tabular-nums leading-tight max-lg:text-3xl max-sm:text-2xl">{azn(total.cost)}</p>
                <p className="flex flex-wrap gap-1.5 text-xs font-semibold tabular-nums text-white/80 max-sm:gap-1 max-sm:text-[11px]">
                  {[`${total.km.toLocaleString("az")} km`, `${total.liters.toFixed(1)} L`, `${total.days}/${range.workdays} gün`].map((t) => (
                    <span key={t} className="whitespace-nowrap rounded-md bg-white/10 px-2 py-0.5 max-sm:px-1.5">{t}</span>
                  ))}
                </p>
              </div>
              <div className="mt-auto border-t border-white/15 pt-2.5 max-sm:mt-2 max-sm:pt-2">
                <p className={`mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold max-sm:mb-1 ${BAL_CLS[balanceText(balance).tone]}`}>
                  <span>{balanceText(balance).text}</span>
                  <span className="text-[11px] font-medium text-white/50 max-[400px]:hidden">{monthR.label}</span>
                </p>
                <div className="grid grid-cols-3 gap-2 max-sm:gap-1">
                  {([["Ayda sərf", azn(month.cost), ""], ["Ayda aldığın", azn(month.paid), ""],
                    ["Ayın balansı", `${balance > 0 ? "+" : ""}${azn(balance)}`, BAL_CLS[balanceText(balance).tone]]] as const).map(([l, v, c]) => (
                    <div key={l} className="min-w-0 rounded-lg bg-white/[0.08] px-2.5 py-1.5 text-center max-sm:px-1 max-sm:py-1">
                      <p className="truncate text-[11px] text-white/55 max-sm:text-[10px]">{l}</p>
                      <p className={`whitespace-nowrap text-sm font-extrabold tabular-nums max-[400px]:text-xs ${c}`}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>

      {(!per100 || !price) && (
        <p className="rounded-xl bg-[#fff6e5] px-4 py-2.5 text-sm text-amber-800">
          {[!fuelName && "yanacaq növü", !per100 && "100 km-ə sərf", fuelName && !price && `${fuelName.toLowerCase()} qiyməti`].filter(Boolean).join(", ")} hələ
          yazılmayıb (admin yazır): km yazılır, məbləğ bunlar yazılandan sonra hesablanacaq.
        </p>
      )}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold"><Gauge size={18} className="text-primary" /> Bu gün</h2>
        {data === null ? (
          <div className="card muted py-10 text-center text-sm">Yüklənir...</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 max-sm:flex-col max-sm:gap-2">
              <Step kind="start" max={todayRow?.end_km ?? undefined} value={todayRow?.start_km ?? null} photo={todayRow?.start_photo ?? null} at={todayRow?.start_at ?? null}
                onSave={(km, file) => save("start", km, file)} />
              <Step kind="end" value={todayRow?.end_km ?? null} photo={todayRow?.end_photo ?? null} at={todayRow?.end_at ?? null}
                min={todayRow?.start_km} disabled={!todayRow} onSave={(km, file) => save("end", km, file)} />
            </div>
            {/* Günün yekunu: axşam km yazılandan sonra (km × sərf / 100 × həmin növün qiyməti) */}
            {live && (
              <div className="relative mt-3 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#15803d,#16a34a_55%,#22c55e)] px-5 py-4 text-white shadow-[0_14px_30px_-14px_rgba(18,161,80,0.9)] max-sm:mt-2 max-sm:rounded-xl max-sm:px-4 max-sm:py-3">
                {/* bəzək: yumşaq dairə + solğun yol ikonu */}
                <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
                <Route aria-hidden size={84} strokeWidth={1.4} className="pointer-events-none absolute -bottom-3 right-3 text-white/10 max-sm:hidden" />
                <p className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/85">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20"><Check size={12} strokeWidth={3} /></span> Günün yekunu
                </p>
                <div className="relative mt-2 grid grid-cols-2 divide-x divide-white/20 max-sm:mt-1.5">
                  <div className="pr-4 max-sm:pr-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/65">Getdin</p>
                    <p className="text-3xl font-extrabold tabular-nums leading-tight max-sm:text-2xl">{live.km} <span className="text-base font-bold text-white/75 max-sm:text-sm">km</span></p>
                  </div>
                  <div className="pl-4 max-sm:pl-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/65">Yanacaq pulu</p>
                    <p className="text-3xl font-extrabold tabular-nums leading-tight max-sm:text-2xl">{live.cost != null ? azn(Number(live.cost)) : "—"}</p>
                  </div>
                </div>
                {live.liters != null && (
                  <p className="relative mt-2.5 flex items-center gap-1.5 whitespace-nowrap border-t border-white/20 pt-2 text-xs font-semibold text-white/85 max-sm:mt-2 max-sm:text-[11px]">
                    <Fuel size={13} className="shrink-0 text-white/70" /> Günlük sərf edilən yanacaq: <b className="text-white">{Number(live.liters).toFixed(2)} L{live.fuel_type ? ` ${FUEL_LABEL[live.fuel_type]?.toLowerCase()}` : ""}</b>
                  </p>
                )}
                <p className="relative mt-2 flex flex-wrap gap-1.5 text-xs font-semibold tabular-nums text-white/90 max-sm:mt-2 max-sm:gap-1 max-sm:text-[11px]">
                  {[
                    `${live.start_km.toLocaleString("az")} → ${live.end_km!.toLocaleString("az")} km`,
                    live.fuel_price != null ? `${live.fuel_price} ₼ / L` : null,
                  ].filter(Boolean).map((t) => <span key={t} className="whitespace-nowrap rounded-full bg-white/15 px-2.5 py-0.5 max-sm:px-2">{t}</span>)}
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Şirkətin verdiyi yanacaq pulu: hər ödənişi təsdiqlə */}
      {data && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
            <HandCoins size={18} className="text-primary" /> <span>Aldığım yanacaq pulu<span className="max-sm:hidden"> · {range.label}</span></span>
            {payments.some((p) => p.status === "pending") && (
              <span className="whitespace-nowrap rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">{payments.filter((p) => p.status === "pending").length} təsdiq gözləyir</span>
            )}
          </h2>
          {payments.length === 0 ? (
            <p className="card muted py-6 text-center text-sm">Bu dövrdə şirkət yanacaq pulu verməyib.</p>
          ) : (
            <PaymentsCard payments={payments} onConfirm={confirm} />
          )}
        </section>
      )}

      {rows && (
        <section>
          <h2 className="mb-3 flex flex-wrap items-center gap-x-2 text-base font-bold">
            <CalendarDays size={18} className="text-primary" /> Günlük hesab
            <span className="text-sm font-semibold text-muted">· {PERIOD_LABEL[period].toLowerCase()}: {range.label}</span>
          </h2>
          {rows.length === 0 ? (
            <p className="card muted py-8 text-center text-sm">Bu dövrdə yürüş yazılmayıb.</p>
          ) : (() => {
            const maxKm = Math.max(1, ...rows.map((r) => r.km ?? 0));
            const diff = Math.round((paid - total.cost) * 100) / 100;
            return (
              <div className="card overflow-hidden !p-0">
                <div className="flex items-center justify-between border-b border-line bg-[#f8fafc] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted max-sm:px-3">
                  <span>Gün və yürüş</span><span>Sərf · alınan</span>
                </div>
                <ul className="divide-y divide-line">
                  {rows.map((r) => {
                    const got = payments.filter((p) => p.day === r.day).reduce((n, p) => n + Number(p.amount), 0);
                    const isToday = r.day === today;
                    return (
                      <li key={r.id} className={`grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 max-sm:gap-2.5 max-sm:px-3 ${isToday ? "bg-primary-soft/40" : ""}`}>
                        <div className={`grid h-11 w-11 place-items-center rounded-xl text-center leading-none ${isToday ? "bg-primary text-white" : "bg-bg"}`}>
                          <span><b className="block text-base tabular-nums">{Number(r.day.slice(8))}</b><span className={`text-[10px] font-semibold ${isToday ? "text-white/80" : "text-muted"}`}>{WEEKDAY_SHORT[d12(r.day).getUTCDay()]}</span></span>
                        </div>
                        <div className="min-w-0">
                          <p className="flex items-baseline gap-x-2 gap-y-0.5 whitespace-nowrap">
                            <b className="text-[15px] tabular-nums">{r.km != null ? r.km.toLocaleString("az") : "—"} <span className="text-xs font-semibold text-muted">km</span></b>
                            <span className="muted truncate text-xs tabular-nums max-sm:hidden">
                              {r.start_km.toLocaleString("az")} → {r.end_km != null ? r.end_km.toLocaleString("az") : "axşam yazılmayıb"}{r.liters != null && ` · ${Number(r.liters).toFixed(1)} L`}
                            </span>
                            {isToday && <span className="rounded-full bg-primary-soft px-1.5 text-[10px] font-bold text-primary sm:hidden">bu gün</span>}
                          </p>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg" aria-hidden>
                            <div className="h-full rounded-full bg-gradient-to-r from-frost to-primary" style={{ width: `${Math.max(3, ((r.km ?? 0) / maxKm) * 100)}%` }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold tabular-nums">{r.cost != null ? azn(Number(r.cost)) : "—"}</p>
                          <p className={`text-xs font-semibold tabular-nums ${got ? "text-ok" : "text-muted"}`}>{got ? `+${azn(got)}` : "—"}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line bg-[#f8fafc] px-4 py-3 max-sm:px-3 max-sm:py-2.5">
                  <p className="text-sm font-bold">Cəmi <span className="font-semibold text-muted">· {total.days}/{range.workdays} gün · {total.km.toLocaleString("az")} km · {total.liters.toFixed(1)} L</span></p>
                  <p className="flex items-center gap-2 text-sm font-extrabold tabular-nums">
                    <span>{azn(total.cost)}</span>
                    <span className="text-ok">+{azn(paid)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${diff < 0 ? "bg-[#fff0f0] text-[#dc2626]" : diff > 0 ? "bg-[#fff6e5] text-amber-700" : "bg-ok-soft text-ok"}`}>{diff > 0 ? "+" : ""}{azn(diff)}</span>
                  </p>
                </div>
              </div>
            );
          })()}
        </section>
      )}
    </div>
  );
}
