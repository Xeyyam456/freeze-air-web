import type { Company } from "./Company";
import type { Store } from "./Store";
import type { WorkDay } from "./WorkDay";

export type ClientDetailRaw = { client: Company | null; units: Store[]; logs: WorkDay[]; groups: Map<number, string> };
