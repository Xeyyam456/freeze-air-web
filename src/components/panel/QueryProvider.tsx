"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { WORK_SAVED } from "@/components/work/MyDay";
import { getQueryClient } from "@/lib/queryClient";
import { revalidate } from "@/lib/revalidate";
import { TASKS_CHANGED } from "@/lib/tasks-live";

// Usta panelinin məlumat keşi (TanStack Query): useData / revalidate() bunu işlədir (admin ilə eyni, lib/queryClient.ts).
// Pəncərə hadisələri → aid keş açarları yenilənir (komponentlər hadisəni ayrıca dinləmir):
// iş yazılanda (WORK_SAVED) və tapşırıq dəyişəndə (TASKS_CHANGED, Realtime; "görüldü" iş qeydi də yaradır)
const ON = {
  [WORK_SAVED]: ["my-day-stats", "work-history", "month-stats", "work-tab", "place-history"],
  [TASKS_CHANGED]: ["my-day-stats", "work-history", "tasks-view", "tasks-week", "month-stats", "work-tab", "place-history"],
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const off = Object.entries(ON).map(([event, keys]) => {
      const fn = () => revalidate(...keys);
      window.addEventListener(event, fn);
      return () => window.removeEventListener(event, fn);
    });
    return () => off.forEach((f) => f());
  }, []);
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
