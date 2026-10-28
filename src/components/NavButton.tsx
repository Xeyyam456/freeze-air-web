"use client";

import { useState } from "react";
import { Navigation, Navigation2, X } from "lucide-react";
import { directionsUrl, wazeUrl } from "@/lib/navigation";
import { Modal } from "@/shared/components/Modal";

type Place = { name: string; address: string | null; lat: number | null; lng: number | null };

// "Naviqator" (yalnız telefonda, < 640): filialın/mağazanın ünvanına getmək üçün Waze və ya Google Maps seçimi.
// Seçim pəncərədə iki iri düymə; hər biri telefonda öz tətbiqini açır (yoxdursa brauzerdə).
export function NavButton({ place }: { place: Place }) {
  const [open, setOpen] = useState(false);
  const hasLocation = (place.lat != null && place.lng != null) || !!place.address;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} disabled={!hasLocation} title={hasLocation ? undefined : "Nə ünvan, nə koordinat yazılıb"}
        className="btn btn-primary btn-sm !h-9 w-full sm:hidden">
        <Navigation size={14} /> Naviqator
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="nav-title" className="!max-w-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="nav-title" className="text-lg font-bold">Naviqator seç</h2>
              <p className="muted line-clamp-2 text-sm">{place.name}{place.address ? ` · ${place.address}` : ""}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
          </div>
          <div className="grid gap-2.5">
            <a href={wazeUrl(place)} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#33ccff] font-bold text-[#06192b]">
              <Navigation2 size={18} /> Waze ilə get
            </a>
            <a href={directionsUrl(place)} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1f6feb] font-bold text-white">
              <Navigation size={18} /> Google Maps ilə get
            </a>
          </div>
        </Modal>
      )}
    </>
  );
}
