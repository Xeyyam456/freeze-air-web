import type { MyLeaveRow } from "./MyLeaveRow";

export type ActiveLeavesProps = { items: MyLeaveRow[]; today: string; onGiveUp: (id: number) => void; onCancel: (id: number) => void };
