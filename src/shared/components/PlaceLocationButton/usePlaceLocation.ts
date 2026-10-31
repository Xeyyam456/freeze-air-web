import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseCoordinates } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { Place, PlaceFix, PlaceLocationState } from "@/types/clients";
import { MAX_ACC } from "./constants";
import { meters } from "./distance";

// Konumu düzəltmə vəziyyəti (0087, RPC place_set_location; hər dəyişiklik jurnala düşür):
// ünvan, GPS ilə tapılan və ya əl ilə yazılan koordinat, təsdiq
export function usePlaceLocation(place: Place): PlaceLocationState {
  const router = useRouter();
  const [address, setAddress] = useState(place.address ?? "");
  const [fix, setFix] = useState<PlaceFix | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState<"addr" | "coord" | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [manual, setManual] = useState("");
  const hasCoords = place.lat != null && place.lng != null;
  const dist = fix && hasCoords ? meters(fix, { lat: place.lat!, lng: place.lng! }) : null;
  const goodFix = !!fix && (!!fix.manual || fix.acc <= MAX_ACC);
  const manualBad = manual.trim() !== "" && !parseCoordinates(manual);
  const addrChanged = address.trim() !== (place.address ?? "").trim() && address.trim().length > 0;

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

  return { address, setAddress, fix, locating, busy, confirm, setConfirm, manual, hasCoords, dist, goodFix, manualBad, addrChanged, find, onManual, save };
}
