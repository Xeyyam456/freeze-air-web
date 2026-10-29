import type { MyTask } from "./MyTask";
import type { MyTaskEmployee } from "./MyTaskEmployee";
import type { MyTaskTeam } from "./MyTaskTeam";

export type TeamGroupCardProps = { g: MyTaskTeam; employees: MyTaskEmployee[]; logOf: (t: MyTask) => number | null; onViewLog: (logId: number) => void };
