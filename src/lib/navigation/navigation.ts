import type { NavPlace } from "@/types/shared";

// Koordinat varsa dəqiq nöqtə, yoxdursa ünvan.
function query(p: NavPlace) {
  if (p.lat != null && p.lng != null) return `${p.lat},${p.lng}`;
  return p.address ?? "";
}

// Panel içində iframe ilə göstərmək üçün
export function mapEmbedUrl(p: NavPlace) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query(p))}&z=16&output=embed`;
}

// Ayrıca tabda Google Maps-də açmaq üçün
export function mapSearchUrl(p: NavPlace) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query(p))}`;
}

// Google Maps marşrutu (telefonda tətbiq açılır, istifadəçinin yerindən ünvana)
export function directionsUrl(p: NavPlace) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query(p))}&travelmode=driving`;
}

// Waze ilə naviqasiya: koordinat varsa dəqiq nöqtə, yoxsa ünvan (telefonda Waze tətbiqi açılır)
export function wazeUrl(p: NavPlace) {
  if (p.lat != null && p.lng != null) return `https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;
  return `https://waze.com/ul?q=${encodeURIComponent(p.address ?? "")}&navigate=yes`;
}

// "40.40930, 49.86710" formatını (Google Maps-dən kopyalanan) oxuyur.
export function parseCoordinates(input: string): { lat: number; lng: number } | null {
  const m = input.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}
