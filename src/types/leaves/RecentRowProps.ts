import type { Leave } from "@/types/attendance";

export type RecentRowProps = { leave: Leave; today: string; onGiveUp: (id: number) => void; onCancel: (id: number) => void };
