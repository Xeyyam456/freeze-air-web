import type { MyTask } from "./MyTask";

export type DaySummaryProps = { me: number | null | undefined; mineLive: MyTask[]; total: number; done: number; people: number };
