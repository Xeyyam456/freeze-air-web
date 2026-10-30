import type { MyLeaveRow } from "./MyLeaveRow";

export type LeaveCardProps = { leave: MyLeaveRow; today: string; onGiveUp?: () => void; onCancel?: () => void };
