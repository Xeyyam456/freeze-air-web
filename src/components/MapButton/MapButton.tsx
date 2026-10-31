"use client";

import { useState } from "react";
import { ExternalLink, Map as MapIcon, MapPin, X } from "lucide-react";
import { mapEmbedUrl, mapSearchUrl } from "@/lib/navigation";
import { Modal } from "@/shared/components/Modal";
import type { MapButtonProps } from "@/types/shared";

export function MapButton({ place }: MapButtonProps) {
  const [open, setOpen] = useState(false);
  const hasLocation = (place.lat != null && place.lng != null) || !!place.address;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} disabled={!hasLocation}
        className="btn btn-soft btn-sm" title={hasLocation ? undefined : "Nə ünvan, nə koordinat yazılıb"}>
        <MapIcon size={14} /> Xəritədə göstər
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} labelledBy="map-title" className="!max-w-4xl overflow-hidden !p-0">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-4 max-sm:items-start max-sm:px-4">
            <div className="min-w-0 flex-1">
              <h2 id="map-title" className="flex items-center gap-2 text-lg font-bold">
                {place.code && <span className="code-badge shrink-0 whitespace-nowrap">{place.code}</span>}
                <span className="line-clamp-2">{place.name}</span>
              </h2>
              <p className="muted mt-0.5 flex items-start gap-1.5 text-sm">
                <MapPin size={14} className="mt-[3px] shrink-0" /> {place.address ?? "Ünvan yazılmayıb"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 max-sm:contents">
              {/* Mobildə: bağla düyməsi başlığın yanında, "Google Maps-də aç" altda tam endə */}
              <a href={mapSearchUrl(place)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm max-sm:order-last max-sm:basis-full">
                <ExternalLink size={14} /> Google Maps-də aç
              </a>
              <button type="button" onClick={() => setOpen(false)} className="icon-btn" aria-label="Bağla">
                <X size={18} />
              </button>
            </div>
          </div>
          <iframe
            src={mapEmbedUrl(place)}
            title={`${place.name} xəritədə`}
            className="block h-[520px] w-full border-t border-line max-sm:h-[60dvh]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Modal>
      )}
    </>
  );
}
