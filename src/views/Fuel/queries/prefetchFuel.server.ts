import { fetchMyFuel } from "@/services/myFuel/fetchMyFuel";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { PrefetchEntry } from "@/types/panel";
import type { DbClient } from "@/types/shared";
import { rangeOf } from "../shared/rangeOf";
import { MY_FUEL_KEY } from "./keys";

// Yanacaq: açılışdakı dövr "gün" (bu gün) + balansın ayı. Açar useFuelLog → useMyFuelData ilə eynidir.
export async function prefetchFuel(db: DbClient, employeeId: number): Promise<PrefetchEntry[]> {
  const today = todayBaku();
  const r = rangeOf("day", today);
  const m = rangeOf("month", today);
  const data = await fetchMyFuel(employeeId, r.from, r.to, today, m.from, m.to, db);
  return [{ key: [MY_FUEL_KEY, employeeId, r.from, r.to, today, m.from, m.to], data }];
}
