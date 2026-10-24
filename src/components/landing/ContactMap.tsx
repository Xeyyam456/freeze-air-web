"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Navigation, Navigation2, Route } from "lucide-react";
import { toast } from "@/lib/toast";

type Texts = { reset: string; route: string; routeLoading: string; routeDenied: string; routeOpen: string; waze: string };

// Əlaqə xəritəsi.
// Ünvan rejimi: Google xəritəni ünvana görə ortalayır, bizim döyünən nişan da ortadadır. İstifadəçi xəritəyə toxunanda
// (iframe fokus alır → pəncərə "blur" olur) nişan gizlənir və "Ünvana qayıt" düyməsi çıxır (iframe yenidən yüklənir).
// Marşrut rejimi: "Marşrut qur" brauzerdən yeri soruşur (geolocation), xəritə həmin nöqtədən ünvana yolu çəkir
// (açarsız embed: saddr/daddr). "Naviqasiyanı aç" Google Maps-i naviqasiya ilə açır (telefonda tətbiq açılır).
export function ContactMap({ address, title, texts }: { address: string; title: string; texts: Texts }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [moved, setMoved] = useState(false);
  const [version, setVersion] = useState(0);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const dest = encodeURIComponent(address);
  const src = origin
    ? `https://www.google.com/maps?saddr=${origin.lat},${origin.lng}&daddr=${dest}&output=embed&hl=az`
    : `https://www.google.com/maps?q=${dest}&z=16&output=embed&hl=az`;
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving${origin ? `&origin=${origin.lat},${origin.lng}` : ""}`;

  // Waze: ünvanla naviqasiya (telefonda və planşetdə Waze tətbiqi açılır, yoxdursa waze.com); masaüstündə lazım deyil
  const wazeUrl = `https://waze.com/ul?q=${dest}&navigate=yes`;

  useEffect(() => {
    const onBlur = () => {
      // Fokus xəritənin iframe-inə keçibsə, istifadəçi xəritə ilə işləyir
      setTimeout(() => {
        if (document.activeElement === frame.current) setMoved(true);
      }, 0);
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  const reset = () => {
    setOrigin(null);
    setVersion((v) => v + 1);
    setMoved(false);
  };

  const buildRoute = () => {
    if (!("geolocation" in navigator)) {
      toast.error(texts.routeDenied);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setOrigin({ lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) });
        setVersion((v) => v + 1);
        setMoved(false);
      },
      () => {
        setLocating(false);
        toast.error(texts.routeDenied);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  const btn = "inline-flex h-12 items-center gap-2 rounded-full px-6 font-bold shadow-[0_16px_36px_rgba(6,25,43,0.3)] transition-all hover:-translate-y-px";

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

      {/* Düymələr aşağıda ortada: ünvan rejimində "Marşrut qur", marşrut rejimində "Naviqasiyanı aç"; sürüşdürüləndə və ya
          marşrutdan sonra "Ünvana qayıt" */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-3">
        {!origin ? (
          <button type="button" onClick={buildRoute} disabled={locating} className={`${btn} bg-cold text-white hover:bg-night disabled:translate-y-0 disabled:opacity-80`}>
            <Route size={18} className={locating ? "animate-pulse" : ""} /> {locating ? texts.routeLoading : texts.route}
          </button>
        ) : (
          <a href={navUrl} target="_blank" rel="noopener noreferrer" className={`${btn} bg-cold text-white hover:bg-night`}>
            <Navigation size={18} /> {texts.routeOpen}
          </a>
        )}
        <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#33ccff] text-night hover:bg-white lg:hidden`}>
          <Navigation2 size={18} /> {texts.waze}
        </a>
        {(moved || origin) && (
          <button type="button" onClick={reset} className={`${btn} bg-night text-white hover:bg-cold`}>
            <LocateFixed size={18} /> {texts.reset}
          </button>
        )}
      </div>
    </div>
  );
}
