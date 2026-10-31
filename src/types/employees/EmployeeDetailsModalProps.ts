import type { Employee } from "./Employee";

export type EmployeeDetailsModalProps = { employee: Employee; isMe: boolean; onClose: () => void };
