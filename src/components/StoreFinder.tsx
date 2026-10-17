"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, MapPinOff, Navigation, Phone, Search } from "lucide-react";
import { useEscapeLayer } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { directionsUrl, wazeUrl } from "@/lib/navigation";

type Result = {
  key: string;
  code: string | null;
  title: string;
  sub: string | null; // şirkət / market şəbəkəsi
  address: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
};

// PostgREST or=() sintaksisini pozan simvollar (vergül, mötərizə, faiz, ulduz) boşluqla əvəz olunur
function clean(q: string) {
  return q.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim();
}

async function search(q: string): Promise<Result[]> {
  const supabase = createClient();
  const like = `%${q}%`;
  const [stores, companies] = await Promise.all([
    supabase.from("stores").select("id, code, name, address, lat, lng, phone, companies(name)")
      .or(`code.ilike.${like},name.ilike.${like},address.ilike.${like}`).order("code").limit(8),
    // Sabit məkanlı şirkətlər (stadion, villa...): ünvanı və ya koordinatı olanlar
    supabase.from("companies").select("id, name, address, lat, lng, phone")
      .ilike("name", like).or("address.not.is.null,lat.not.is.null").limit(3),
  ]);
  return [
    ...(stores.data ?? []).map((s) => ({
      key: `s${s.id}`, code: s.code, title: s.name, sub: s.companies?.name ?? null, address: s.address, phone: s.phone, lat: s.lat, lng: s.lng,
    })),
    ...(companies.data ?? []).map((c) => ({
      key: `c${c.id}`, code: null, title: c.name, sub: "Şirkət", address: c.address, phone: c.phone, lat: c.lat, lng: c.lng,
    })),
  ];
}

// Mağaza / filial axtarışı: kod (ARZ-045), ad və ya ünvanla; nəticədə "Yol tap" (Google Maps marşrutu) və Waze.
// Nəticələr aşağıdakı kartların üstündə açılan siyahıdır (kartı sıxışdırmır).
export function StoreFinder() {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState<{ q: string; items: Result[] } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const q = clean(input);
  const active = q.length >= 2;

  useEscapeLayer(() => setOpen(false), open && active);

  // Yazanda 250 ms gözləyib axtarır; gec gələn köhnə cavab yenisinin üstünə yazılmır
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const t = setTimeout(() => {
      search(q).then((items) => {
        if (!cancelled) setRes({ q, items });
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, active]);

  // Kənara klikləyəndə siyahı bağlanır
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const loading = active && res?.q !== q;
  const items = res?.q === q ? res.items : [];

  return (
    <section ref={rootRef} className="card relative z-20 !py-4">
      <label className="relative block">
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input value={input} onChange={(e) => { setInput(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder="Mağaza kodu və ya adı (məs. ARZ-045)" aria-label="Mağaza və filial axtarışı" className="field !pl-10" />
      </label>

      {open && active && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_16px_40px_rgba(16,24,40,0.18)]">
          {loading ? (
            <p className="muted px-4 py-5 text-center text-sm">Axtarılır...</p>
          ) : items.length === 0 ? (
            <p className="muted px-4 py-5 text-center text-sm">Heç nə tapılmadı.</p>
          ) : (
            <ul className="nice-scroll max-h-[min(420px,calc(100vh-300px))] divide-y divide-line overflow-y-auto">
              {items.map((r) => {
                const hasLocation = (r.lat != null && r.lng != null) || !!r.address;
                const waze = wazeUrl(r);
                return (
                  <li key={r.key} className="flex items-center gap-3 px-4 py-3">
                    {r.code ? <span className="code-badge shrink-0">{r.code}</span> : <span className="icon-tile !h-8 !w-8 shrink-0"><Building2 size={15} /></span>}
                    <div className="min-w-0 flex-1">
                      {r.sub && <p className="muted truncate text-xs font-semibold">{r.sub}</p>}
                      <p className="truncate text-sm font-bold">{r.title}</p>
                      <p className="muted truncate text-xs">{r.address ?? "Ünvan yazılmayıb"}</p>
                    </div>
                    {r.phone && (
                      <a href={`tel:${r.phone}`} className="icon-btn" title={r.phone} aria-label={`Zəng et: ${r.phone}`}><Phone size={15} /></a>
                    )}
                    {hasLocation ? (
                      <a href={directionsUrl(r)} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm shrink-0">
                        <Navigation size={14} /> Yol tap
                      </a>
                    ) : (
                      <button type="button" disabled className="btn btn-soft btn-sm shrink-0" title="Nə ünvan, nə koordinat yazılıb">
                        <MapPinOff size={14} /> Yer yoxdur
                      </button>
                    )}
                    {waze && (
                      <a href={waze} target="_blank" rel="noopener noreferrer" className="btn btn-soft btn-sm shrink-0" title="Waze-də aç">Waze</a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
