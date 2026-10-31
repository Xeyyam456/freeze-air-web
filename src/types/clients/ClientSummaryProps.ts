import type { Kind } from "@/lib/kinds";
import type { ClientTotals } from "./ClientTotals";

export type ClientSummaryProps = { kind: Kind; count: number; totals: ClientTotals };
