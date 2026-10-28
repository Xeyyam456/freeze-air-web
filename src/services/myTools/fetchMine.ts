import type { DepotRequest, Tool } from "@/types/depot";
import { createClient } from "@/lib/supabase/client";
import type { Mine } from "@/types/myTools/Mine";
import type { Held } from "@/types/myTools/Held";

export async function fetchMine(employeeId: number) {
  const supabase = createClient();
  const [{ data: holds }, { data: requests }, { data: stock }, { data: all }] = await Promise.all([
    supabase.from("tool_assignments").select("id, tool_id, quantity, taken_at, received_at, disputed_at, tools(name, kind, unit, pack_name, pack_size)")
      .eq("employee_id", employeeId).is("returned_at", null).order("taken_at"),
    supabase.from("depot_requests").select("*").eq("employee_id", employeeId).in("type", ["return", "request", "writeoff"])
      .order("created_at", { ascending: false }).limit(60),
    supabase.from("tool_stock").select("*").order("name"),
    // Kimdə nə var: bütün ustaların üzərindəkilər (yalnız baxış)
    supabase.from("tool_assignments").select("id, tool_id, employee_id, quantity, taken_at, employees(full_name, photo_url), tools(name, kind, unit, pack_name, pack_size)")
      .is("returned_at", null).order("taken_at"),
  ]);
  return { holds: (holds ?? []) as Mine[], requests: (requests ?? []) as DepotRequest[], stock: (stock ?? []) as Tool[], all: (all ?? []) as Held[] };
}
