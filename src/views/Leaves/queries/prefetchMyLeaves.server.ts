import { fetchMyLeaves } from "@/services/leaves/fetchMyLeaves";
import type { PrefetchEntry } from "@/types/panel";
import type { DbClient } from "@/types/shared";
import { MY_LEAVES_KEY } from "./keys";

// İcazələrim: ustanın sorğuları serverdə hazır (açar useMyLeaves ilə eynidir: [MY_LEAVES_KEY, employeeId])
export async function prefetchMyLeaves(db: DbClient, employeeId: number | null): Promise<PrefetchEntry[]> {
  return [{ key: [MY_LEAVES_KEY, employeeId], data: employeeId ? await fetchMyLeaves(employeeId, db) : [] }];
}
