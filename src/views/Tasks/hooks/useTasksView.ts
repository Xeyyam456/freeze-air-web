import { useState } from "react";
import { useMe } from "@/lib/me";
import { getQueryClient } from "@/lib/queryClient";
import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { setTaskDone } from "@/services/myTasks/tasks";
import type { MyTask, MyTasksData } from "@/types/myTasks";
import { TASKS_VIEW_KEY, TASKS_WEEK_KEY, useMyTasksData, useWeekRows } from "../queries/useMyTasksData";
import { iso, weekStart } from "../utils/days";
import { useTeamGroups } from "./useTeamGroups";

// Səhifənin vəziyyəti: gün, həftə, məlumat, açıq pəncərələr (təmir qeydi, iş), "görüldü" işarəsi (optimistik)
export function useTasksView() {
  const [today] = useState(() => iso(new Date()));
  const [day, setDay] = useState(today);
  const meCard = useMe(); // undefined = yüklənir, null = əməkdaş kartı yoxdur
  const me = meCard === null ? null : meCard?.id;
  const from = weekStart(day);
  const data = useMyTasksData(day);
  const weekRows = useWeekRows(from);
  const [noteFor, setNoteFor] = useState<MyTask | null>(null); // təmir barədə yazı pəncərəsi
  const [viewLog, setViewLog] = useState<number | null>(null); // işin pəncərəsi (fayllara baxmaq)
  // İş qeydi: özününkü, yoxdursa qrupun başqa üzvününkü (pəncərə qrupun bütün fayllarını göstərir)
  const logOf = (t: MyTask) => t.work_log_id ?? data?.tasks.find((x) => t.group_id && x.group_id === t.group_id && x.work_log_id)?.work_log_id ?? null;
  const load = () => revalidate(TASKS_VIEW_KEY, TASKS_WEEK_KEY, "my-day-stats", "work-history");
  // Keçmiş gün bağlıdır (bazada da: 0070): nə işarələmək, nə təmir qeydi
  const past = day < today;

  async function toggle(t: MyTask) {
    if (past) return;
    // Dərhal əks olunur, xəta olsa geri qayıdır
    getQueryClient().setQueryData<MyTasksData | null>([TASKS_VIEW_KEY, day], (d) => d && { ...d, tasks: d.tasks.map((x) => (x.id === t.id ? { ...x, done: !t.done } : x)) });
    const error = await setTaskDone(t.id, !t.done);
    if (error) toast.error(error);
    else if (!t.done) toast.success(t.group_id ? "Tapşırıq bütün qrup üçün görüldü" : "Tapşırıq görüldü, iş qeydə alındı");
    load();
  }

  return {
    today, day, setDay, me, from, data, past, logOf, load, toggle,
    weekRows: weekRows ?? [], noteFor, setNoteFor, viewLog, setViewLog,
    ...useTeamGroups(data, me),
  };
}
