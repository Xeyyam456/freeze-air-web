import type { MyLeaveRow } from "./MyLeaveRow";

export type MyLeavesStats = { year: number; month: number; pending: number; next: MyLeaveRow | null };
