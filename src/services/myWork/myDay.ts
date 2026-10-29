import { todayBaku } from "@/lib/attendance";
import { createClient } from "@/lib/supabase/client";
import type { MyDayStats } from "@/types/myWork";

// Yerli tarix "YYYY-MM-DD"
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Mənim bugünüm: bu gün və bu ay yazdığım işlər, bugünkü tapşırıqlarım, məndə olan alət və material
export async function fetchMyDayStats(employeeId: number): Promise<MyDayStats> {
  const supabase = createClient();
  const today = todayIso();
  const [day, month, tasks, held] = await Promise.all([
    supabase.from("work_logs").select("id", { count: "exact", head: true }).eq("employee_id", employeeId).eq("work_date", today),
    supabase.from("work_logs").select("id", { count: "exact", head: true }).eq("employee_id", employeeId).gte("work_date", `${today.slice(0, 8)}01`).lte("work_date", today),
    supabase.from("tasks").select("done").eq("employee_id", employeeId).eq("task_date", today).is("cancelled_at", null),
    supabase.from("tool_assignments").select("quantity, tools(kind)").eq("employee_id", employeeId).is("returned_at", null),
  ]);
  const h = held.data ?? [];
  return {
    today: day.count ?? 0,
    month: month.count ?? 0,
    tasks: { total: tasks.data?.length ?? 0, done: tasks.data?.filter((t) => t.done).length ?? 0 },
    tools: h.filter((a) => a.tools?.kind !== "material").reduce((s, a) => s + a.quantity, 0),
    materials: h.filter((a) => a.tools?.kind === "material").length,
  };
}

// "İşə gəldim" / "İşi bitirdim": başlama və ya bitmə saatı, ya da xəta
export async function checkIn() {
  const { data, error } = await createClient().rpc("check_in");
  return { time: data ?? null, error: error?.message ?? null };
}
export async function checkOut() {
  const { data, error } = await createClient().rpc("check_out");
  return { time: data ?? null, error: error?.message ?? null };
}

// Bugünkü təsdiqlənmiş icazəni ləğv et (leave_cancel); icazə yoxdursa heç nə etmir. Xəta mətni və ya null
export async function cancelTodayLeave(employeeId: number) {
  const supabase = createClient();
  const t = todayBaku();
  const { data: lv } = await supabase.from("leave_requests").select("id").eq("employee_id", employeeId).eq("status", "approved")
    .lte("date_from", t).gte("date_to", t).maybeSingle();
  if (!lv) return null;
  const { error } = await supabase.rpc("leave_cancel", { p_id: lv.id });
  return error?.message ?? null;
}
