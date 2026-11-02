import { createClient } from "@/lib/supabase/client";
import { localDate } from "@/shared/utils/localDate";

// Bugünkü görülməmiş (və geri alınmamış) tapşırıqların sayı
export async function countOpenTasks(employeeId: number): Promise<number> {
  const { count } = await createClient()
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .eq("task_date", localDate())
    .eq("done", false)
    .is("cancelled_at", null);
  return count ?? 0;
}
