// Yerli tarix "YYYY-MM-DD"; offset gün qədər irəli/geri (dünən: -1)
export function dayIso(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "14:32" (Bakı vaxtı)
export function bakuTime(iso: string) {
  return new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}
