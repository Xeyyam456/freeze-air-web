import { fetchMe } from "@/services/me/fetchMe";
import { fetchMyTasks } from "@/services/myTasks/fetchMyTasks";
import { fetchWeek } from "@/services/myTasks/tasks";
import { todayBaku } from "@/shared/utils/todayBaku";
import type { PrefetchEntry } from "@/types/panel";
import type { DbClient } from "@/types/shared";
import { shift, weekStart } from "../utils/days";
import { TASKS_VIEW_KEY, TASKS_WEEK_KEY } from "./useMyTasksData";

// Tapşırıqlar səhifəsi: bu günün tapşırıqları, həftə zolağı və "mən" (öz kartım vurğulanır).
// Açarlar useTasksView ilə eynidir; gün Bakı vaxtı ilə (server UTC-dədir).
export async function prefetchTasks(db: DbClient): Promise<PrefetchEntry[]> {
  const day = todayBaku();
  const from = weekStart(day);
  const [me, view, week] = await Promise.all([fetchMe(db), fetchMyTasks(day, db), fetchWeek(from, shift(from, 6), db)]);
  return [
    { key: ["me"], data: me },
    { key: [TASKS_VIEW_KEY, day], data: view },
    { key: [TASKS_WEEK_KEY, from], data: week },
  ];
}
