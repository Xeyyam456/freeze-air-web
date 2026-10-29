import type { MyEmployeeTasks } from "./MyEmployeeTasks";
import type { MyTask } from "./MyTask";

export type TeamEmployeeCardProps = MyEmployeeTasks & { logOf: (t: MyTask) => number | null; onViewLog: (logId: number) => void };
