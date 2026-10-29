import { createClient } from "@/lib/supabase/client";
import type { WeekRow } from "@/types/myTasks";

// Həftə zolağı üçün: hər gün neçə tapşırıq (geri alınanlar sayılmır) və onlardan neçəsi mənimdir
export async function fetchWeek(from: string, to: string): Promise<WeekRow[]> {
  const { data } = await createClient().from("tasks").select("task_date, employee_id, group_id")
    .gte("task_date", from).lte("task_date", to).is("cancelled_at", null);
  return data ?? [];
}

// Görüldü: iş avtomatik "Görülən işlər"ə düşür; geri alınanda boş avtomatik iş silinir (bazada task_set_done). Xəta mətni və ya null
export async function setTaskDone(id: number, done: boolean) {
  const { error } = await createClient().rpc("task_set_done", { p_task_id: id, p_done: done });
  return error?.message ?? null;
}
