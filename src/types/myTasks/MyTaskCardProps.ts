import type { MyTask } from "./MyTask";
import type { MyTasksData } from "./MyTasksData";

export type MyTaskCardProps = {
  t: MyTask;
  data: MyTasksData;
  past: boolean;
  fileLog: number | null;
  onToggle: () => void;
  onNote: () => void;
  onViewLog: (logId: number) => void;
};
