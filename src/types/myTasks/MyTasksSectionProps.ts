import type { MyTask } from "./MyTask";
import type { MyTasksData } from "./MyTasksData";

export type MyTasksSectionProps = {
  mine: MyTask[];
  liveCount: number;
  data: MyTasksData;
  past: boolean;
  logOf: (t: MyTask) => number | null;
  onToggle: (t: MyTask) => void;
  onNote: (t: MyTask) => void;
  onViewLog: (logId: number) => void;
};
