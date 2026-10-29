import { createClient } from "@/lib/supabase/client";
import type { MyFuelData } from "@/types/myFuel";

// Dövrün yürüşləri, bu günün sətri (dövrdən asılı deyil) və hazırkı yanacaq qiymətləri
// mFrom..mTo: seçilmiş dövrün ayı — balans aylıq hesablanır ("hər ayın öz hesabı")
export async function fetchMyFuel(employeeId: number, from: string, to: string, today: string, mFrom: string, mTo: string): Promise<MyFuelData> {
  const supabase = createClient();
  const [{ data }, { data: t }, { data: s }, { data: pays }, { data: allCost }, { data: allPaid }] = await Promise.all([
    supabase.from("mileage_logs").select("*").eq("employee_id", employeeId).gte("day", from).lte("day", to).order("day", { ascending: false }),
    supabase.from("mileage_logs").select("*").eq("employee_id", employeeId).eq("day", today).maybeSingle(),
    supabase.from("fuel_settings").select("petrol_price, diesel_price").eq("id", 1).maybeSingle(),
    // Şirkətin verdiyi yanacaq pulu (0080): dövrün siyahısı + ayın balansı (ayda alınan − ayda sərf)
    supabase.from("fuel_payments").select("*").eq("employee_id", employeeId).gte("day", from).lte("day", to).order("day", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("mileage_logs").select("cost").eq("employee_id", employeeId).gte("day", mFrom).lte("day", mTo).not("cost", "is", null),
    supabase.from("fuel_payments").select("amount").eq("employee_id", employeeId).gte("day", mFrom).lte("day", mTo),
  ]);
  const month = {
    cost: (allCost ?? []).reduce((n, r) => n + Number(r.cost), 0),
    paid: (allPaid ?? []).reduce((n, p) => n + Number(p.amount), 0),
  };
  return { rows: data ?? [], today: t ?? null, prices: { petrol: s?.petrol_price ?? null, diesel: s?.diesel_price ?? null }, payments: pays ?? [], month };
}
