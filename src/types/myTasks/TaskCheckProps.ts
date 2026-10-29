import type { MyTask } from "./MyTask";

export type TaskCheckProps = { t: MyTask; past: boolean; onToggle: () => void };
