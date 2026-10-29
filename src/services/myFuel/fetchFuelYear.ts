import { createClient } from "@/lib/supabase/client";
import type { ExcelLog, ExcelPay } from "@/types/myFuel";

// Excel üçün: ustanın maşını, ilin bütün yürüşləri və ödənişləri (rəqəmlər Number-ə çevrilib)
export async function fetchFuelYear(employeeId: number, year: string) {
  const supabase = createClient();
  const [{ data: emp }, { data: logsAll }, { data: paysAll }] = await Promise.all([
    supabase.from("employees").select("full_name, car_plate, car_model, fuel_per_100, fuel_type").eq("id", employeeId).maybeSingle(),
    supabase.from("mileage_logs").select("day, start_km, end_km, km, liters, cost, fuel_price, fuel_per_100").eq("employee_id", employeeId).gte("day", `${year}-01-01`).lte("day", `${year}-12-31`).order("day"),
    supabase.from("fuel_payments").select("day, amount, status, note").eq("employee_id", employeeId).gte("day", `${year}-01-01`).lte("day", `${year}-12-31`).order("day").order("created_at"),
  ]);
  const logs: ExcelLog[] = (logsAll ?? []).map((r) => ({ ...r, liters: r.liters != null ? Number(r.liters) : null, cost: r.cost != null ? Number(r.cost) : null, fuel_price: r.fuel_price != null ? Number(r.fuel_price) : null, fuel_per_100: r.fuel_per_100 != null ? Number(r.fuel_per_100) : null }));
  const pays: ExcelPay[] = (paysAll ?? []).map((p) => ({ ...p, amount: Number(p.amount) }));
  return { emp: emp ?? null, logs, pays };
}
