import { createClient } from "@/lib/supabase/server";

// Yanacaq səhifəsi: giriş etmiş ustanın maşın məlumatı (maşını yoxdursa has_car=false)
export async function fetchFuelEmployee() {
  const supabase = await createClient();
  const { data: me } = await supabase.rpc("my_employee_id");
  if (!me) return null;
  const { data: emp } = await supabase.from("employees").select("id, has_car, car_plate, car_model, fuel_per_100, fuel_type").eq("id", me).maybeSingle();
  return emp;
}
