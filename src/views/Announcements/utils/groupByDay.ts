import { formatDateAz } from "@/shared/utils/formatDateAz";
import type { Announcement, AnnouncementDayGroup } from "@/types/announcements";

// Elanlar günlərə görə: "Bu gün", "Dünən", "27 oktyabr" (bu il) / "27 oktyabr 2025" (Bakı vaxtı)
const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" });

function dayLabel(d: string, today: string) {
  const diff = Math.round((Date.parse(today) - Date.parse(d)) / 86_400_000);
  if (diff === 0) return "Bu gün";
  if (diff === 1) return "Dünən";
  const full = formatDateAz(d);
  return d.slice(0, 4) === today.slice(0, 4) ? full.replace(/ \d{4}$/, "") : full;
}

export function groupByDay(items: Announcement[], now = new Date()): AnnouncementDayGroup[] {
  const today = day.format(now);
  const groups: AnnouncementDayGroup[] = [];
  for (const a of items) {
    const label = dayLabel(day.format(new Date(a.created_at)), today);
    const last = groups.at(-1);
    if (last?.label === label) last.items.push(a);
    else groups.push({ label, items: [a] });
  }
  return groups;
}
