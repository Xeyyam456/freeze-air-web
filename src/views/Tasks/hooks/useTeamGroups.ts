import { useMemo } from "react";
import type { MyTask, MyTasksData, MyTaskTeam } from "@/types/myTasks";

// Komanda (başqalarının tək və qrup tapşırıqları), mənim tapşırıqlarım və günün sayları
export function useTeamGroups(data: MyTasksData | null, me: number | null | undefined) {
  const groups = useMemo(() => {
    if (!data) return [];
    return data.employees
      .map((e) => ({ employee: e, items: data.tasks.filter((t) => t.employee_id === e.id && !t.group_id) }))
      .filter((g) => g.items.length > 0 && g.employee.id !== me);
  }, [data, me]);
  // Başqalarının qrup tapşırıqları (0071): bir group_id = bir kart; mənim olduğum qrup yuxarıda «Mənim tapşırıqlarım»dadır
  const teams = useMemo<MyTaskTeam[]>(() => {
    if (!data) return [];
    const map = new Map<string, MyTask[]>();
    for (const t of data.tasks) if (t.group_id) map.set(t.group_id, [...(map.get(t.group_id) ?? []), t]);
    return [...map]
      .filter(([, rows]) => !rows.some((t) => t.employee_id === me))
      .map(([id, rows]) => ({ id, rows, live: rows.filter((t) => !t.cancelled_at) }));
  }, [data, me]);
  const mine = data?.tasks.filter((t) => t.employee_id === me) ?? [];
  const liveRows = data?.tasks.filter((t) => !t.cancelled_at) ?? []; // geri alınanlar saya düşmür
  // Saylarda qrup tapşırığı (0071) bir tapşırıqdır: hər group_id-dən bir sətir (qrup birlikdə görülür)
  const live = liveRows.filter((t, i) => !t.group_id || liveRows.findIndex((x) => x.group_id === t.group_id) === i);
  return {
    groups, teams, mine, live,
    mineLive: mine.filter((t) => !t.cancelled_at),
    doneAll: live.filter((t) => t.done).length,
    people: new Set(liveRows.map((t) => t.employee_id)).size,
  };
}
