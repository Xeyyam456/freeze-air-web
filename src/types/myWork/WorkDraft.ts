import type { Place } from "./Place";

// Yeni işin qaralaması (yalnız bu brauzerdə); fayllar saxlanmır
export type WorkDraft = { work_date?: string; description?: string; place?: Place | null; materials?: Record<number, string> };
