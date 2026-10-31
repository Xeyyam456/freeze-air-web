// GPS ilə tapılmış və ya əl ilə yazılmış koordinat (manual: GPS dəqiqliyi yoxdur)
export type PlaceFix = { lat: number; lng: number; acc: number; manual?: boolean };
