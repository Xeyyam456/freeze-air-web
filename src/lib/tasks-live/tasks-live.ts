import { useSyncExternalStore } from "react";
import { countOpenTasks } from "@/services/myTasks/countOpenTasks";

// Tapşırıq dəyişəndə (Realtime, views/Tasks/live/) bu hadisə atılır: Tapşırıqlar siyahısı və "Mənim bugünüm" yenilənir
export const TASKS_CHANGED = "tasks-changed";

// Menyudakı nişan: bugünkü görülməmiş (və geri alınmamış) öz tapşırıqlarımın sayı (əməkdaş kartı olmayan hesabda 0)
let openCount = 0;
const listeners = new Set<() => void>();

export async function refreshMyOpenTasks(employeeId: number | null) {
  const n = employeeId ? await countOpenTasks(employeeId) : 0;
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
