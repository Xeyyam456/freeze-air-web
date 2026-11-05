import { fetchMine } from "@/services/myTools/fetchMine";
import type { PrefetchEntry } from "@/types/panel";
import type { DbClient } from "@/types/shared";

// Alətlərim: üzərimdəkilər, sorğularım, anbar, kimdə nə var. Açar MyTools-dakı useData ilə eynidir: ["my-tools", usta id]
export async function prefetchMyTools(db: DbClient, employeeId: number | null): Promise<PrefetchEntry[]> {
  if (!employeeId) return [];
  return [{ key: ["my-tools", employeeId], data: await fetchMine(employeeId, db) }];
}
