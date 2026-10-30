import type { LeaveFilter } from "./LeaveFilter";
import type { MyLeaveRow } from "./MyLeaveRow";

export type LeaveHistoryProps = {
  filter: LeaveFilter;
  counts: Record<LeaveFilter, number>;
  total: number;
  byMonth: [string, MyLeaveRow[]][];
  today: string;
  onFilter: (f: LeaveFilter) => void;
};
