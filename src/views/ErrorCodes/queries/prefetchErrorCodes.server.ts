import { fetchCodes } from "@/services/errorCodes/fetchCodes";
import type { PrefetchEntry } from "@/types/panel";
import type { DbClient } from "@/types/shared";
import { ERROR_CODES_KEY } from "./keys";

// Xəta kodları: modellər + kodlar serverdə hazır (açar useErrorCodes ilə eynidir)
export async function prefetchErrorCodes(db: DbClient): Promise<PrefetchEntry[]> {
  return [{ key: [ERROR_CODES_KEY], data: await fetchCodes(db) }];
}
