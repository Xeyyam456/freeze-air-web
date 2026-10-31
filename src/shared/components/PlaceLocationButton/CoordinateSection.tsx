import { Check, LocateFixed } from "lucide-react";
import type { PlaceSectionProps } from "@/types/clients";
import { FixPreview } from "./FixPreview";

// 2) Koordinat: GPS ilə (həmin yerdə olanda) və ya əl ilə
export function CoordinateSection({ place, loc }: PlaceSectionProps) {
  const { fix } = loc;
  return (
    <section className="mt-5 border-t border-line pt-4">
      <span className="label">Koordinat</span>
      <p className="muted text-sm">
        {loc.hasCoords ? <>Hazırda: <b className="tabular-nums text-ink">{place.lat!.toFixed(5)}, {place.lng!.toFixed(5)}</b></> : "Koordinat yazılmayıb: xəritə ünvanla axtarır."}
      </p>
      <p className="muted mt-1 text-xs">Həmin yerdəsənsə açıq yerdə dayan və «Mövcud yerimi tap» bas; yerdə deyilsənsə koordinatı aşağıda əl ilə yaz.</p>

      <button type="button" onClick={loc.find} disabled={loc.locating} className="btn btn-soft btn-sm mt-2 w-full">
        <LocateFixed size={14} className={loc.locating ? "animate-pulse" : ""} /> {loc.locating ? "Yer təyin olunur..." : fix && !fix.manual ? "Yenidən tap" : "Mövcud yerimi tap"}
      </button>

      <div className="mt-3">
        <span className="label">Və ya koordinatı əl ilə yaz</span>
        <input value={loc.manual} onChange={(e) => loc.onManual(e.target.value)} inputMode="decimal" autoComplete="off" spellCheck={false}
          placeholder="40.40930, 49.86710" className={`field tabular-nums ${loc.manualBad ? "!border-danger" : ""}`} />
        <p className={`mt-1 text-xs ${loc.manualBad ? "font-semibold text-danger" : "muted"}`}>
          {loc.manualBad ? "Format səhvdir: «enlik, uzunluq» kimi yaz (məs. 40.40930, 49.86710)." : "Google Maps-də yerə uzun bas və ya sağ klik et, koordinatı kopyalayıb bura yapışdır."}
        </p>
      </div>

      {fix && <FixPreview fix={fix} goodFix={loc.goodFix} dist={loc.dist} />}

      {fix && (
        <button type="button" disabled={!loc.goodFix || loc.busy !== null} onClick={() => loc.setConfirm(true)} className="btn btn-primary btn-sm mt-2 w-full">
          <Check size={14} /> Bu koordinatı yaz
        </button>
      )}
    </section>
  );
}
