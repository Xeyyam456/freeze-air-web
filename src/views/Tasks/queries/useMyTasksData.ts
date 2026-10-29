import { useData } from "@/lib/useData";
import { fetchMyTasks } from "@/services/myTasks/fetchMyTasks";
import { fetchWeek } from "@/services/myTasks/tasks";
import { shift } from "../utils/days";

// Keşdə: tapşırıq dəyişəndə (Realtime → TASKS_CHANGED) QueryProvider "tasks-view" və "tasks-week"-i yeniləyir
export const TASKS_VIEW_KEY = "tasks-view";
export const TASKS_WEEK_KEY = "tasks-week";

export const useMyTasksData = (day: string) => useData(TASKS_VIEW_KEY, () => fetchMyTasks(day), [day]);
export const useWeekRows = (from: string) => useData(TASKS_WEEK_KEY, () => fetchWeek(from, shift(from, 6)), [from]);
