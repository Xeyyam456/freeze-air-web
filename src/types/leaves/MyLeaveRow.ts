import type { Leave } from "@/types/attendance";

export type MyLeaveRow = Leave & { decided_at: string | null };
