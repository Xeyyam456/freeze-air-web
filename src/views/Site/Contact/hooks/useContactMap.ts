import { useEffect, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import type { ContactMapTexts } from "@/types/site";

// Əlaqə xəritəsinin vəziyyəti.
// Ünvan rejimi: istifadəçi xəritəyə toxunanda (iframe fokus alır → pəncərə "blur" olur) nişan gizlənir (moved) və
// "Ünvana qayıt" çıxır. Marşrut rejimi: "Marşrut qur" brauzerdən yeri soruşur (geolocation), xəritə həmin nöqtədən
// ünvana yolu çəkir (açarsız embed: saddr/daddr).
export function useContactMap(address: string, texts: ContactMapTexts) {
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

  return { frame, moved, version, origin, locating, src, navUrl, wazeUrl, reset, buildRoute };
}
