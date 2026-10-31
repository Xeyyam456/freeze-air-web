// Azərbaycan nömrəsini oxunaqlı formata salır: "+994702373721" → "+994 70 237 37 21".
// Tanınmayan format olduğu kimi qalır.
export function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  const local = d.startsWith("994") && d.length === 12 ? d.slice(3) : d.startsWith("0") && d.length === 10 ? d.slice(1) : null;
  if (!local) return phone.trim();
  return `+994 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}

// WhatsApp linki (yalnız mobil nömrə formatında)
export function whatsappHref(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d.length >= 11 ? `https://wa.me/${d}` : undefined;
}

// Zəng linki üçün: yalnız rəqəmlər və "+"
export function telHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.length >= 7 ? `tel:${digits}` : undefined;
}
