import type { EmployeeListProps, EmployeesRaw } from "@/types/employees";
import { buildStatus } from "./buildStatus";
import { countWork } from "./countWork";

// Xam məlumatdan kartların göstərdiyi say və vəziyyət
export function employeesView(raw: EmployeesRaw, today: string): EmployeeListProps {
  return {
    employees: raw.employees,
    ...countWork(raw.monthLogs, today),
    status: buildStatus(raw.employees, raw.attendance, raw.leaves, today),
    myEmployeeId: raw.myEmployeeId,
  };
}
