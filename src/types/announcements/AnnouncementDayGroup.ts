import type { Announcement } from "./Announcement";

// Elanlar günlərə görə: "Bu gün", "Dünən", "27 oktyabr"
export type AnnouncementDayGroup = { label: string; items: Announcement[] };
