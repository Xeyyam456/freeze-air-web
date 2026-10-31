"use client";

import { useState } from "react";
import { MapPinned } from "lucide-react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import type { PlaceLocationButtonProps } from "@/types/clients";
import { fmtDist } from "./distance";
import { PlaceLocationModal } from "./PlaceLocationModal";
import { usePlaceLocation } from "./usePlaceLocation";

// Usta mağaza/filial/sabit məkanın ünvanını və koordinatını düzəldir (0087; hər dəyişiklik jurnala düşür):
//  • Ünvan: mağazada olmasa belə dəqiq ünvanı yazıb saxlamaq olur.
//  • Koordinat: usta həmin yerdədirsə "Mövcud yerimi tap" (GPS, dəqiqlik ≤ 100 m) → "Bu koordinatı yaz".
export function PlaceLocationButton({ place, className = "btn btn-soft btn-sm", label = "Konumu düzəlt" }: PlaceLocationButtonProps) {
  const [open, setOpen] = useState(false);
  const loc = usePlaceLocation(place);
  const { fix, dist } = loc;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} title="Ünvan və koordinat səhvdirsə düzəlt">
        <MapPinned size={14} /> {label}
      </button>

      {open && <PlaceLocationModal place={place} loc={loc} onClose={() => setOpen(false)} />}
      {/* Təsdiq ayrıca pəncərədə (ekranın ortasında): aşağı sürüşdürmək lazım olmasın */}
      <ConfirmModal
        open={loc.confirm && !!fix}
        title={loc.hasCoords ? "Koordinat dəyişsin?" : "Koordinat yazılsın?"}
        message={fix && (
          <>
            {loc.hasCoords && <>Köhnə: <b className="tabular-nums">{place.lat!.toFixed(5)}, {place.lng!.toFixed(5)}</b><br /></>}
            Yeni: <b className="tabular-nums">{fix.lat}, {fix.lng}</b>
            {dist !== null && <> · köhnədən {fmtDist(dist)}</>}
            <br />Dəyişiklik jurnala düşür.
          </>
        )}
        confirmLabel="Bəli, yaz"
        pending={loc.busy === "coord"}
        onCancel={() => loc.setConfirm(false)}
        onConfirm={() => loc.save("coord")}
      />
    </>
  );
}
