import type { Employee } from "./Employee";
import type { PersonStatus } from "./PersonStatus";

export type EmployeeListProps = {
  employees: Employee[];
  todayWork: Record<number, number>; // usta id → bu gün yazılan iş sayı
  monthWork: Record<number, number>; // usta id → bu ay yazılan iş sayı
  status: Record<number, PersonStatus>; // usta id → bu günkü davamiyyət vəziyyəti
  myEmployeeId: number | null;
};
