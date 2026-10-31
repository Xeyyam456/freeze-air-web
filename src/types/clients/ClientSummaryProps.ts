import type { ClientTotals } from "./ClientTotals";
import type { Kind } from "@/types/clients";

export type ClientSummaryProps = { kind: Kind; count: number; totals: ClientTotals };
