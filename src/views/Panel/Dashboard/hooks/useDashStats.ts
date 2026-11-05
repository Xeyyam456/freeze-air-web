"use client";

import { useData } from "@/lib/useData";
import { fetchMyDayStats } from "@/services/myWork/myDay";

// Göstərici kartlarının məlumatı (bu gün, bu ay, tapşırıq, məndə). "Mənim bugünüm" ilə eyni açar: bir sorğu,
// iş yazılanda və tapşırıq dəyişəndə QueryProvider "my-day-stats"-ı yeniləyir.
export function useDashStats(me: number | null | undefined) {
  return useData("my-day-stats", () => (me ? fetchMyDayStats(me) : Promise.resolve(null)), [me]);
}
