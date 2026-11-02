import { formatDateAz } from "@/shared/utils/formatDateAz";
import type { Announcement } from "@/types/announcements";

// Elanlar günlərə görə: "Bu gün", "Dünən", "27 oktyabr" (bu il) / "27 oktyabr 2025"; sətirdə yalnız saat (Bakı vaxtı)
const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" });
const time = new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false });

export const timeText = (iso: string) => time.format(new Date(iso));

// Son 24 saat: "Yeni" nişanı
export const isFresh = (iso: string, now = Date.now()) => now - Date.parse(iso) < 86_400_000;

function dayLabel(d: string, today: string) {
  const diff = Math.round((Date.parse(today) - Date.parse(d)) / 86_400_000);
  if (diff === 0) return "Bu gün";
  if (diff === 1) return "Dünən";
  const full = formatDateAz(d);
  return d.slice(0, 4) === today.slice(0, 4) ? full.replace(/ \d{4}$/, "") : full;
}

export function groupByDay(items: Announcement[], now = new Date()) {
  const today = day.format(now);
  const groups: { label: string; items: Announcement[] }[] = [];
  for (const a of items) {
    const label = dayLabel(day.format(new Date(a.created_at)), today);
    const last = groups.at(-1);
    if (last?.label === label) last.items.push(a);
    else groups.push({ label, items: [a] });
  }
  return groups;
}
