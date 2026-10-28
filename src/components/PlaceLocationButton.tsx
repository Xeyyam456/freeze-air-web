"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crosshair, LocateFixed, MapPinned, X } from "lucide-react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Modal } from "@/shared/components/Modal";
import { mapEmbedUrl, parseCoordinates } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

type Place = { kind: "store" | "company"; id: number; code?: string | null; name: string; address: string | null; lat: number | null; lng: number | null };
type Fix = { lat: number; lng: number; acc: number; manual?: boolean }; // manual: əl ilə yazılıb (GPS dəqiqliyi yoxdur)

const MAX_ACC = 100; // GPS dəqiqliyi bundan pisdirsə koordinat yazılmır (metr)

// İki nöqtə arası məsafə (metr)
function meters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const fmtDist = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);

// Usta mağaza/filial/sabit məkanın ünvanını və koordinatını düzəldir (0087, RPC place_set_location; hər dəyişiklik jurnala düşür):
//  • Ünvan: mağazada olmasa belə dəqiq ünvanı yazıb saxlamaq olur.
//  • Koordinat: usta həmin yerdədirsə "Mövcud yerimi tap" (GPS, dəqiqlik ≤ 100 m) → "Bu koordinatı yaz".
export function PlaceLocationButton({ place, className = "btn btn-soft btn-sm", label = "Konumu düzəlt" }: { place: Place; className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [address, setAddress] = useState(place.address ?? "");
  const [fix, setFix] = useState<Fix | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState<"addr" | "coord" | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [manual, setManual] = useState("");
  const hasCoords = place.lat != null && place.lng != null;
  const dist = fix && hasCoords ? meters(fix, { lat: place.lat!, lng: place.lng! }) : null;
  const goodFix = !!fix && (fix.manual || fix.acc <= MAX_ACC);
  const manualBad = manual.trim() !== "" && !parseCoordinates(manual);

  function find() {
    if (!("geolocation" in navigator)) return toast.error("Bu cihazda məkan xidməti yoxdur.");
    setLocating(true);
    setConfirm(false);
    setManual("");
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocating(false); setFix({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6), acc: Math.round(p.coords.accuracy) }); },
      () => { setLocating(false); toast.error("Yerin təyin olunmadı.", "Brauzerdə məkana icazə ver və açıq yerdə yenidən yoxla."); },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }

  // Koordinatı əl ilə yaz: Google Maps-də yerə basıb koordinatı kopyala ("40.40930, 49.86710")
  function onManual(v: string) {
    setManual(v);
    setConfirm(false);
    const c = parseCoordinates(v);
    setFix(c ? { lat: c.lat, lng: c.lng, acc: 0, manual: true } : null);
  }

  async function save(kind: "addr" | "coord") {
    setBusy(kind);
    const args = kind === "addr"
      ? { p_kind: place.kind, p_id: place.id, p_address: address.trim() }
      : { p_kind: place.kind, p_id: place.id, p_lat: fix!.lat, p_lng: fix!.lng, ...(fix!.manual ? {} : { p_accuracy: fix!.acc }) };
    const { error } = await createClient().rpc("place_set_location", args);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(kind === "addr" ? "Ünvan yadda saxlandı" : "Koordinat yadda saxlandı", `${place.code ? `${place.code} · ` : ""}${place.name}`);
    setConfirm(false);
    if (kind === "coord") { setFix(null); setManual(""); }
    router.refresh();
  }

  const addrChanged = address.trim() !== (place.address ?? "").trim() && address.trim().length > 0;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} title="Ünvan və koordinat səhvdirsə düzəlt">
        <MapPinned size={14} /> {label}
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="loc-title" className="!max-w-lg">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="loc-title" className="text-lg font-bold">Konumu düzəlt</h2>
              <p className="muted truncate text-sm">{place.code ? `${place.code} · ` : ""}{place.name}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
          </div>

          {/* 1) Ünvan: yerdə olmasan da dəyişmək olar */}
          <section>
            <span className="label">Dəqiq ünvan</span>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} maxLength={300} className="field resize-none" placeholder="Məs. Bakı, Nəsimi r., Neftçilər pr. 120" />
            <p className="muted mt-1 text-xs">Mağazada olmasan belə, düzgün ünvanı bilirsənsə yaza bilərsən.</p>
            <button type="button" disabled={!addrChanged || busy !== null} onClick={() => save("addr")} className="btn btn-secondary btn-sm mt-2 w-full">
              <Check size={14} /> {busy === "addr" ? "..." : "Ünvanı yadda saxla"}
            </button>
          </section>

          {/* 2) Koordinat: yalnız həmin yerdə olanda */}
          <section className="mt-5 border-t border-line pt-4">
            <span className="label">Koordinat</span>
            <p className="muted text-sm">
              {hasCoords ? <>Hazırda: <b className="tabular-nums text-ink">{place.lat!.toFixed(5)}, {place.lng!.toFixed(5)}</b></> : "Koordinat yazılmayıb: xəritə ünvanla axtarır."}
            </p>
            <p className="muted mt-1 text-xs">Həmin yerdəsənsə açıq yerdə dayan və «Mövcud yerimi tap» bas; yerdə deyilsənsə koordinatı aşağıda əl ilə yaz.</p>

            <button type="button" onClick={find} disabled={locating} className="btn btn-soft btn-sm mt-2 w-full">
              <LocateFixed size={14} className={locating ? "animate-pulse" : ""} /> {locating ? "Yer təyin olunur..." : fix && !fix.manual ? "Yenidən tap" : "Mövcud yerimi tap"}
            </button>

            <div className="mt-3">
              <span className="label">Və ya koordinatı əl ilə yaz</span>
              <input value={manual} onChange={(e) => onManual(e.target.value)} inputMode="decimal" autoComplete="off" spellCheck={false}
                placeholder="40.40930, 49.86710" className={`field tabular-nums ${manualBad ? "!border-danger" : ""}`} />
              <p className={`mt-1 text-xs ${manualBad ? "font-semibold text-danger" : "muted"}`}>
                {manualBad ? "Format səhvdir: «enlik, uzunluq» kimi yaz (məs. 40.40930, 49.86710)." : "Google Maps-də yerə uzun bas və ya sağ klik et, koordinatı kopyalayıb bura yapışdır."}
              </p>
            </div>

            {fix && (
              <div className="mt-3 overflow-hidden rounded-xl border border-line">
                <iframe src={mapEmbedUrl({ lat: fix.lat, lng: fix.lng, address: null })} title="Tapılan yer" className="block h-40 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                <div className="space-y-1 bg-bg px-3 py-2 text-sm">
                  <p className="flex flex-wrap items-center gap-x-2"><Crosshair size={14} className="text-primary" /> <b className="tabular-nums">{fix.lat}, {fix.lng}</b></p>
                  {fix.manual ? (
                    <p className="muted text-xs">Əl ilə yazılıb: xəritədə doğru yer olduğunu yoxla.</p>
                  ) : (
                    <p className={`text-xs font-semibold ${goodFix ? "text-ok" : "text-danger"}`}>
                      GPS dəqiqliyi: ±{fix.acc} m {goodFix ? "(yaxşıdır)" : `(pisdir, ≤ ${MAX_ACC} m olmalıdır: açıq yerdə gözlə və yenidən tap)`}
                    </p>
                  )}
                  {dist !== null && (
                    <p className={`text-xs ${dist > 1000 ? "font-semibold text-amber-700" : "muted"}`}>
                      Köhnə koordinatdan {fmtDist(dist)} uzaqdır{dist > 1000 ? ": əmin ol ki, düz mağazanın qarşısındasan" : ""}.
                    </p>
                  )}
                </div>
              </div>
            )}

            {fix && (
              <button type="button" disabled={!goodFix || busy !== null} onClick={() => setConfirm(true)} className="btn btn-primary btn-sm mt-2 w-full">
                <Check size={14} /> Bu koordinatı yaz
              </button>
            )}
          </section>
        </Modal>
      )}
      {/* Təsdiq ayrıca pəncərədə (ekranın ortasında): aşağı sürüşdürmək lazım olmasın */}
      <ConfirmModal
        open={confirm && !!fix}
        title={hasCoords ? "Koordinat dəyişsin?" : "Koordinat yazılsın?"}
        message={fix && (
          <>
            {hasCoords && <>Köhnə: <b className="tabular-nums">{place.lat!.toFixed(5)}, {place.lng!.toFixed(5)}</b><br /></>}
            Yeni: <b className="tabular-nums">{fix.lat}, {fix.lng}</b>
            {dist !== null && <> · köhnədən {fmtDist(dist)}</>}
            <br />Dəyişiklik jurnala düşür.
          </>
        )}
        confirmLabel="Bəli, yaz"
        pending={busy === "coord"}
        onCancel={() => setConfirm(false)}
        onConfirm={() => save("coord")}
      />
    </>
  );
}
