import type { MyEmployeeTasks } from "./MyEmployeeTasks";
import type { MyTask } from "./MyTask";
import type { MyTaskEmployee } from "./MyTaskEmployee";
import type { MyTaskTeam } from "./MyTaskTeam";

export type TeamSectionProps = {
  teams: MyTaskTeam[];
  groups: MyEmployeeTasks[];
  employees: MyTaskEmployee[];
  logOf: (t: MyTask) => number | null;
  onViewLog: (logId: number) => void;
};
