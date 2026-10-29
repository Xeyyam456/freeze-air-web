import type { MyTask } from "./MyTask";
import type { MyTaskEmployee } from "./MyTaskEmployee";

export type MyEmployeeTasks = { employee: MyTaskEmployee; items: MyTask[] };
