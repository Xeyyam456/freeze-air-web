import { Crosshair } from "lucide-react";
import { mapEmbedUrl } from "@/lib/navigation";
import type { FixPreviewProps } from "@/types/clients";
import { MAX_ACC } from "./constants";
import { fmtDist } from "./distance";

// Tapılan nöqtənin xəritə önizləməsi, GPS dəqiqliyi və köhnə koordinatdan məsafə
export function FixPreview({ fix, goodFix, dist }: FixPreviewProps) {
  return (
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
  );
}
