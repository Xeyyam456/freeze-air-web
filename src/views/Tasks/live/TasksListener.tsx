"use client";

import { useEffect } from "react";
import { refreshMyOpenTasks } from "@/lib/tasks-live";
import { subscribePanelLive } from "@/services/myTasks/panelLive";
import { onAssignmentChange, onDepotChange } from "./onDepotChange";
import { onLeaveChange } from "./onLeaveChange";
import { onTaskChange } from "./onTaskChange";
import { clearTitle } from "./tabTitle";

// Usta panelinin canlı bildirişləri (panel layout-unda, ekranda heç nə çəkmir): tapşırıqlar, icazə qərarları, depo.
export function TasksListener() {
  useEffect(() => {
    const stop = subscribePanelLive({
      ready: (ctx) => void refreshMyOpenTasks(ctx.me),
      tasks: (p, ctx) => void onTaskChange(p, ctx),
      leaves: onLeaveChange,
      assignments: (p, ctx) => void onAssignmentChange(p, ctx),
      depot: onDepotChange,
    });
    document.addEventListener("visibilitychange", clearTitle);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", clearTitle);
    };
  }, []);

  return null;
}
