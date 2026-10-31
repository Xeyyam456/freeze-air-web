import type { Employee } from "./Employee";
import type { PersonStatus } from "./PersonStatus";

export type EmployeeCardProps = {
  employee: Employee;
  todayCount: number;
  monthCount: number;
  status?: PersonStatus;
  isMe: boolean;
};
