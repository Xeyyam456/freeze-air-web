import { LocateFixed, Navigation, Navigation2, Route } from "lucide-react";
import type { MapActionsProps } from "@/types/site";

const BTN = "inline-flex h-12 items-center gap-2 rounded-full px-6 font-bold shadow-[0_16px_36px_rgba(6,25,43,0.3)] transition-all hover:-translate-y-px";

// Düymələr aşağıda ortada: ünvan rejimində "Marşrut qur", marşrut rejimində "Naviqasiyanı aç" (+ telefonda Waze);
// sürüşdürüləndə və ya marşrutdan sonra "Ünvana qayıt"
export function MapActions({ texts, hasOrigin, showReset, locating, navUrl, wazeUrl, onRoute, onReset }: MapActionsProps) {
  return (
    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-3">
      {!hasOrigin ? (
        <button type="button" onClick={onRoute} disabled={locating} className={`${BTN} bg-cold text-white hover:bg-night disabled:translate-y-0 disabled:opacity-80`}>
          <Route size={18} className={locating ? "animate-pulse" : ""} /> {locating ? texts.routeLoading : texts.route}
        </button>
      ) : (
        <a href={navUrl} target="_blank" rel="noopener noreferrer" className={`${BTN} bg-cold text-white hover:bg-night`}>
          <Navigation size={18} /> {texts.routeOpen}
        </a>
      )}
      <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className={`${BTN} bg-[#33ccff] text-night hover:bg-white lg:hidden`}>
        <Navigation2 size={18} /> {texts.waze}
      </a>
      {showReset && (
        <button type="button" onClick={onReset} className={`${BTN} bg-night text-white hover:bg-cold`}>
          <LocateFixed size={18} /> {texts.reset}
        </button>
      )}
    </div>
  );
}
