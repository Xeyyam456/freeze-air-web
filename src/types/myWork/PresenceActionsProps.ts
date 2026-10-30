import type { MonthAttendance } from "@/types/attendance";

export type PresenceActionsProps = {
  day: MonthAttendance["today"] | undefined;
  checking: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onGiveUpLeave: () => void;
};
