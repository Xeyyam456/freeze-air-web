import type { MonthAttendance } from "@/lib/attendance";

export type PresenceActionsProps = {
  day: MonthAttendance["today"] | undefined;
  checking: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onGiveUpLeave: () => void;
};
