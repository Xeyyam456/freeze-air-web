import { createClient } from "@/lib/supabase/client";
import type { HeldMaterial } from "@/types/myWork";

// Üzərimdəki materiallar (açıq təhvil) və (redaktədə) bu işdə əvvəl yazılan sərf
export async function fetchHeldMaterials(employeeId: number, logId: number | null) {
  const supabase = createClient();
  const [assign, prev] = await Promise.all([
    supabase.from("tool_assignments").select("quantity, tools(id, name, unit, kind)").eq("employee_id", employeeId).is("returned_at", null).then((r) => r.data ?? []),
    logId ? supabase.from("work_log_materials").select("tool_id, amount").eq("work_log_id", logId).then((r) => r.data ?? []) : Promise.resolve([]),
  ]);
  const held: HeldMaterial[] = assign.filter((a) => a.tools?.kind === "material").map((a) => ({ toolId: a.tools!.id, name: a.tools!.name, unit: a.tools!.unit, quantity: a.quantity }))
    .sort((a, b) => a.name.localeCompare(b.name, "az"));
  return { held, prev };
}

// İşlədilən material: əvvəlkilər silinir (redaktədə), sıfırdan böyük olanlar yazılır (yalnız məlumat, depoda say dəyişmir). Uğur: true
export async function saveUsedMaterials(logId: number, rows: { tool_id: number; amount: number }[], replace: boolean) {
  const supabase = createClient();
  if (replace) await supabase.from("work_log_materials").delete().eq("work_log_id", logId);
  if (!rows.length) return true;
  const { error } = await supabase.from("work_log_materials").insert(rows.map((r) => ({ ...r, work_log_id: logId })));
  return !error;
}
