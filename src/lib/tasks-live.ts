import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

// Tapşırıq dəyişəndə (Realtime, components/work/TasksListener.tsx) bu hadisə atılır: Tapşırıqlar siyahısı və "Mənim bugünüm" yenilənir
export const TASKS_CHANGED = "tasks-changed";

// Menyudakı nişan: bugünkü görülməmiş (və geri alınmamış) öz tapşırıqlarımın sayı (əməkdaş kartı olmayan hesabda 0)
let openCount = 0;
const listeners = new Set<() => void>();

function localDate(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export async function refreshMyOpenTasks(employeeId: number | null) {
  let n = 0;
  if (employeeId) {
    const { count } = await createClient()
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("employee_id", employeeId)
      .eq("task_date", localDate())
      .eq("done", false)
      .is("cancelled_at", null);
    n = count ?? 0;
  }
  if (n === openCount) return;
  openCount = n;
  listeners.forEach((l) => l());
}

export function useMyOpenTasks() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => openCount,
    () => 0,
  );
}
