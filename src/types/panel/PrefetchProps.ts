import type { DbClient } from "@/types/shared";
import type { PrefetchEntry } from "./PrefetchEntry";

// load: səhifənin yükləyicisi (views/<Domen>/queries/prefetch*.server.ts) — server klienti ilə sorğuları paralel işlədir
export type PrefetchProps = { load: (db: DbClient) => Promise<PrefetchEntry[]>; children: React.ReactNode };
