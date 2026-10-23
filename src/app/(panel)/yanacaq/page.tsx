import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Page } from "@/components/Page";
import { FuelLog } from "@/components/work/FuelLog";
import { createClient } from "@/lib/supabase/server";

// Yanacaq (0077): yalnız maşını olan usta; başqası ünvanı yazsa Panelə qaytarılır
async function Content() {
  const supabase = await createClient();
  const { data: me } = await supabase.rpc("my_employee_id");
  const { data: emp } = me
    ? await supabase.from("employees").select("id, has_car, car_plate, car_model, fuel_per_100, fuel_type").eq("id", me).maybeSingle()
    : { data: null };
  if (!emp?.has_car) redirect("/panel");
  return <FuelLog employeeId={emp.id} car={emp} />;
}

export default function FuelPage() {
  return (
    <Page title="Yanacaq" subtitle="Səhər və axşam spidometr: sürülən km və yanacaq pulu">
      {/* Tarix render zamanı oxunur: Next 16 bunu Suspense daxilində tələb edir */}
      <Suspense fallback={<div className="card muted">Yüklənir...</div>}>
        <Content />
      </Suspense>
    </Page>
  );
}
