"use client";

import { MapPin } from "lucide-react";
import type { ContactMapProps } from "@/types/site";
import { useContactMap } from "../hooks/useContactMap";
import { MapActions } from "./MapActions";

// Əlaqə xəritəsi: Google xəritəni ünvana görə ortalayır, bizim döyünən nişan da ortadadır;
// "Marşrut qur" istifadəçinin yerindən ünvana yolu çəkir, "Naviqasiyanı aç" Google Maps-i naviqasiya ilə açır.
// (Hook nəticəsi parçalanır: ref saxlayan obyektin sahəsini renderdə oxumaq lint xətasıdır)
export function ContactMap({ address, title, texts }: ContactMapProps) {
  const { frame, moved, version, origin, locating, src, navUrl, wazeUrl, reset, buildRoute } = useContactMap(address, texts);

  return (
    <div className="relative h-[460px] overflow-hidden rounded-[32px] bg-white ring-1 ring-night/5">
      <iframe key={version} ref={frame} src={src} title={title} className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />

      {!origin && !moved && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center" aria-hidden="true">
          <span className="map-pulse absolute inset-0 rounded-full bg-cold/40" />
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-cold text-white shadow-[0_10px_24px_rgba(0,163,217,0.5)] ring-4 ring-white">
            <MapPin size={22} />
          </span>
        </span>
      )}

      <MapActions texts={texts} hasOrigin={!!origin} showReset={moved || !!origin} locating={locating}
        navUrl={navUrl} wazeUrl={wazeUrl} onRoute={buildRoute} onReset={reset} />
    </div>
  );
}
