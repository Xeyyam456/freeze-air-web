import type { AttendanceStub } from "./AttendanceStub";
import type { Employee } from "./Employee";
import type { MonthLog } from "./MonthLog";

// Bazadan gələn xam məlumat (services/employees/fetchEmployees.server.ts)
export type EmployeesRaw = {
  employees: Employee[];
  myEmployeeId: number | null;
  monthLogs: MonthLog[];
  attendance: AttendanceStub[];
  leaves: { employee_id: number }[];
};
