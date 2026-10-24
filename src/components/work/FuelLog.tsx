"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Camera, Check, ChevronLeft, ChevronRight, Fuel, Gauge, HandCoins, ImageIcon, Moon, Pencil, Sun, X } from "lucide-react";
import { MONTHS_AZ, todayBaku } from "@/lib/attendance";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";
import { toast } from "@/lib/toast";

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
function Step({ kind, value, photo, at, min, disabled, onSave }: {
  kind: "start" | "end";
  value: number | null;
  photo: string | null;
  at: string | null;
  min?: number;
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
    if (min !== undefined && n < min) return toast.error(`Axşam km səhərdən (${min}) az ola bilməz.`);
    if (!file && !photo) return toast.error("Spidometrin şəklini çək.");
    setPending(true);
    const ok = await onSave(n, file);
    setPending(false);
    if (ok) { setEditing(false); setKm(""); pick(null); }
  }

  return (
    <section className={`card flex min-w-0 grow basis-[340px] flex-col gap-3 !p-4 ${disabled ? "opacity-60" : ""}`}>
      <header className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${done ? "bg-ok-soft text-ok" : "bg-primary-soft text-primary"}`}>
          {done ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">{title}</span>
          <span className="muted block text-xs">{done && at ? `Yazılıb: ${timeBaku(at)}` : disabled ? "Əvvəl səhər km-ini yaz" : "Spidometrin şəkli + km"}</span>
        </span>
        {done && !disabled && (
          <button type="button" onClick={() => { setEditing(true); setKm(String(value)); }} className="btn btn-soft btn-sm"><Pencil size={13} /> Dəyiş</button>
        )}
      </header>

      {done ? (
        <div className="flex items-center gap-3">
          <Photo path={photo} alt={title} />
          <p className="text-2xl font-extrabold tabular-nums">{value!.toLocaleString("az")} <span className="muted text-sm font-semibold">km</span></p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
          <label className={`grid h-16 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border-2 border-dashed ${
            preview || photo ? "border-primary" : "border-line hover:border-primary"} ${disabled ? "pointer-events-none" : ""}`} title="Şəkil çək və ya seç">
            {preview
              // eslint-disable-next-line @next/next/no-img-element -- yerli önizləmə
              ? <img src={preview} alt="Önizləmə" className="h-full w-full object-cover" />
              : <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-primary"><Camera size={18} /> Şəkil</span>}
            <input type="file" accept="image/*" capture="environment" className="sr-only" disabled={disabled}
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

type Period = "day" | "week" | "month";
const PERIOD_LABEL: Record<Period, string> = { day: "Gün", week: "Həftə", month: "Ay" };
const PERIOD_TOTAL: Record<Period, string> = { day: "Günün yanacaq pulu", week: "Həftənin yanacaq pulu", month: "Ayın yanacaq pulu" };

// Tarix köməkçiləri ("YYYY-MM-DD", UTC günorta ilə: saat qurşağı sürüşməsin); admin Yanacaq səhifəsi ilə eyni
const d12 = (iso: string) => new Date(`${iso}T12:00:00Z`);
const isoOf = (d: Date) => d.toISOString().slice(0, 10);
function addDays(iso: string, n: number) { const d = d12(iso); d.setUTCDate(d.getUTCDate() + n); return isoOf(d); }
function addMonths(iso: string, n: number) { const d = d12(`${iso.slice(0, 7)}-01`); d.setUTCMonth(d.getUTCMonth() + n); return isoOf(d); }
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
function PaymentRow({ p, onConfirm }: { p: Payment; onConfirm: (received: boolean) => void }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 max-sm:gap-x-2 max-sm:gap-y-2 max-sm:px-3 max-sm:py-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary max-sm:hidden"><HandCoins size={17} /></span>
      <span className="min-w-0 flex-[1_1_160px]">
        <span className="block font-bold tabular-nums"><span className="whitespace-nowrap">{azn(Number(p.amount))}</span> <span className="muted whitespace-nowrap text-xs font-semibold">· {dayName(p.day)}</span></span>
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
  const [period, setPeriod] = useState<Period>("week");
  const [anchor, setAnchor] = useState(today);
  const range = rangeOf(period, anchor);
  const [data, setData] = useState<Loaded | null>(null);

  const monthR = rangeOf("month", anchor); // balansın ayı
  const load = useCallback(async () => {
    setData(await fetchRange(employeeId, range.from, range.to, today, monthR.from, monthR.to));
  }, [employeeId, range.from, range.to, today, monthR.from, monthR.to]);
  useEffect(() => {
    let cancelled = false;
    fetchRange(employeeId, range.from, range.to, today, monthR.from, monthR.to).then((d) => { if (!cancelled) setData(d); });
    return () => { cancelled = true; };
  }, [employeeId, range.from, range.to, today, monthR.from, monthR.to]);

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
      if (error) throw new Error(error.message);
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
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-frost max-sm:h-10 max-sm:w-10 max-sm:rounded-xl"><Fuel size={22} /></span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-bold">{car.car_plate ? <span className="plate shrink-0">{car.car_plate}</span> : "Maşın"} <span>{car.car_model}</span></p>
                <p className="text-xs text-white/60">
                  {fuelName ?? "yanacaq seçilməyib"} · {per100 ? `${per100} l / 100 km` : "sərf yazılmayıb"} · {price ? `${price} ₼ / l` : "qiymət yazılmayıb"}
                </p>
              </div>
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
                <p className="tabular-nums text-white/80">{todayRow?.liters != null ? `${Number(todayRow.liters).toFixed(2)} l` : "— l"}</p>
                <p className="text-2xl font-extrabold tabular-nums text-[#4ade80]">{todayRow?.cost != null ? azn(Number(todayRow.cost)) : "—"}</p>
              </div>
              <p className="flex shrink-0 items-baseline gap-2 tabular-nums sm:hidden">
                <b className="text-base font-extrabold">{todayRow?.km ?? 0} <span className="text-xs font-semibold text-white/60">km</span></b>
                <span className="text-xs text-white/60 max-[400px]:hidden">{todayRow?.liters != null ? `${Number(todayRow.liters).toFixed(2)} l` : "— l"}</span>
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
                  : `${todayRow.start_km.toLocaleString("az")} → ${todayRow.end_km.toLocaleString("az")} km${todayRow.fuel_price != null ? ` · ${todayRow.fuel_price} ₼ / l` : ""}`}
              </p>
            </div>
            {/* Seçilmiş dövrün yanacaq pulu: sürülən km-ə görə */}
            <div className="rounded-2xl bg-gradient-to-br from-frost/25 to-primary/30 px-5 py-4 ring-1 ring-frost/30 max-sm:rounded-xl max-sm:px-3 max-sm:py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{PERIOD_TOTAL[period]}<span className="max-lg:hidden"> · {range.label}</span></p>
              <p className="mt-1 text-4xl font-extrabold tabular-nums leading-tight max-lg:text-3xl max-sm:mt-0 max-sm:text-[26px]">{azn(total.cost)}</p>
              <p className="mt-1 text-sm tabular-nums text-white/75 max-sm:mt-0 max-sm:text-xs">{total.km.toLocaleString("az")} km · {total.liters.toFixed(1)} l · {total.days} / {range.workdays} iş günü</p>
              {/* Ayın balansı (0080): ayda alınan − ayda sərf */}
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/15 pt-3 text-sm max-sm:mt-2 max-sm:pt-2 [&_p+p]:whitespace-nowrap max-[400px]:gap-1.5 max-[400px]:[&_p+p]:text-xs">
                <div><p className="text-[11px] text-white/55">Ayda sərf</p><p className="font-extrabold tabular-nums">{azn(month.cost)}</p></div>
                <div><p className="text-[11px] text-white/55">Ayda aldığın</p><p className="font-extrabold tabular-nums">{azn(month.paid)}</p></div>
                <div><p className="text-[11px] text-white/55">Ayın balansı</p><p className={`font-extrabold tabular-nums ${BAL_CLS[balanceText(balance).tone]}`}>{balance > 0 ? "+" : ""}{azn(balance)}</p></div>
              </div>
              <p className={`mt-1 text-xs font-semibold ${BAL_CLS[balanceText(balance).tone]}`}>{balanceText(balance).text}<span className="max-[400px]:hidden"> · {monthR.label}</span></p>
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
            <div className="flex flex-wrap gap-3">
              <Step kind="start" value={todayRow?.start_km ?? null} photo={todayRow?.start_photo ?? null} at={todayRow?.start_at ?? null}
                onSave={(km, file) => save("start", km, file)} />
              <Step kind="end" value={todayRow?.end_km ?? null} photo={todayRow?.end_photo ?? null} at={todayRow?.end_at ?? null}
                min={todayRow?.start_km} disabled={!todayRow} onSave={(km, file) => save("end", km, file)} />
            </div>
            {/* Günün yekunu: axşam km yazılandan sonra (km × sərf / 100 × həmin növün qiyməti) */}
            {/* Telefonda yığcam: üstdə km | məbləğ, altda bir sətir təfərrüat */}
            {live && (
              <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl bg-gradient-to-r from-ok to-[#16a34a] px-6 py-4 text-white max-sm:gap-x-3 max-sm:gap-y-1.5 max-sm:rounded-xl max-sm:px-4 max-sm:py-3 shadow-[0_12px_28px_-14px_rgba(18,161,80,0.9)]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/75">Günün yekunu</p>
                  <p className="text-3xl font-extrabold tabular-nums leading-tight max-sm:text-2xl">{live.km} km <span className="text-lg font-bold text-white/80 max-sm:text-sm">getdin</span></p>
                </div>
                <div className="text-sm text-white/85 max-sm:order-last max-sm:flex max-sm:w-full max-sm:flex-wrap max-sm:gap-x-3 max-sm:border-t max-sm:border-white/20 max-sm:pt-1.5 max-sm:text-xs">
                  <p className="tabular-nums">{live.start_km.toLocaleString("az")} → {live.end_km!.toLocaleString("az")} km</p>
                  {live.liters != null && <p className="tabular-nums">{Number(live.liters).toFixed(2)} l {live.fuel_type ? FUEL_LABEL[live.fuel_type]?.toLowerCase() : ""}{live.fuel_price != null && ` · ${live.fuel_price} ₼ / l`}</p>}
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/75">Yanacaq pulu</p>
                  <p className="text-3xl font-extrabold tabular-nums leading-tight max-sm:text-2xl">{live.cost != null ? azn(Number(live.cost)) : "—"}</p>
                </div>
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
            <ul className="card divide-y divide-line !p-0">
              {payments.map((p) => <PaymentRow key={p.id} p={p} onConfirm={(r) => confirm(p, r)} />)}
            </ul>
          )}
        </section>
      )}

      {rows && (
        <section>
          <h2 className="mb-3 text-base font-bold">{PERIOD_LABEL[period]}: {range.label}</h2>
          {rows.length === 0 ? (
            <p className="card muted py-8 text-center text-sm">Bu dövrdə yürüş yazılmayıb.</p>
          ) : (
            <div className="card overflow-x-auto !p-0">
              <table className="w-full text-sm sm:min-w-[560px] [&_td]:whitespace-nowrap max-sm:[&_td]:px-2.5 max-sm:[&_th]:px-2.5 max-[400px]:text-xs max-[400px]:[&_td]:px-1.5 max-[400px]:[&_th]:px-1.5">
                <thead className="bg-bg text-left text-xs text-muted">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Gün</th>
                    <th className="px-4 py-2 font-semibold max-sm:hidden">Səhər → axşam</th>
                    <th className="px-4 py-2 text-right font-semibold">Km</th>
                    <th className="px-4 py-2 text-right font-semibold max-sm:hidden">Litr</th>
                    <th className="px-4 py-2 text-right font-semibold">Məbləğ</th>
                    <th className="px-4 py-2 text-right font-semibold">Alınan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((r) => (
                    <tr key={r.id} className={r.day === today ? "bg-primary-soft/40" : ""}>
                      <td className="px-4 py-2 font-semibold">{dayName(r.day)}{r.day === today && <span className="ml-1.5 text-[11px] text-primary max-[400px]:hidden">bu gün</span>}</td>
                      <td className="px-4 py-2 tabular-nums max-sm:hidden">{r.start_km.toLocaleString("az")} → {r.end_km != null ? r.end_km.toLocaleString("az") : <span className="muted">axşam yazılmayıb</span>}</td>
                      <td className="px-4 py-2 text-right font-bold tabular-nums">{r.km ?? "—"}</td>
                      <td className="px-4 py-2 text-right tabular-nums max-sm:hidden">{r.liters != null ? Number(r.liters).toFixed(2) : "—"}</td>
                      <td className="px-4 py-2 text-right font-bold tabular-nums">{r.cost != null ? azn(Number(r.cost)) : "—"}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{(() => {
                        const got = payments.filter((p) => p.day === r.day).reduce((n, p) => n + Number(p.amount), 0);
                        return got ? azn(got) : <span className="muted">—</span>;
                      })()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-bg font-bold">
                  <tr>
                    <td className="px-4 py-2">Cəmi <span className="font-semibold text-muted">({total.days} / {range.workdays})</span></td>
                    <td className="px-4 py-2 max-sm:hidden" />
                    <td className="px-4 py-2 text-right tabular-nums">{total.km}</td>
                    <td className="px-4 py-2 text-right tabular-nums max-sm:hidden">{total.liters.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{azn(total.cost)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{azn(paid)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
