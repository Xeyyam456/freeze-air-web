import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Page } from "@/components/Page";
import { Prefetch } from "@/components/panel/Prefetch";
import { FuelLog } from "@/views/Fuel";
import { prefetchFuel } from "@/views/Fuel/queries/prefetchFuel.server";
import { fetchFuelEmployee } from "@/services/myFuel/fetchFuelEmployee.server";
import { Card } from "@/shared/components/Card";

// Yanacaq (0077): yalnız maşını olan usta; başqası ünvanı yazsa Panelə qaytarılır. Məlumat serverdə əvvəlcədən (Prefetch)
async function Content() {
  const emp = await fetchFuelEmployee();
  if (!emp?.has_car) redirect("/panel");
  return (
    <Prefetch load={(db) => prefetchFuel(db, emp.id)}>
      <FuelLog employeeId={emp.id} car={emp} />
    </Prefetch>
  );
}

export default function FuelPage() {
  return (
    <Page title="Yanacaq" subtitle="Səhər və axşam spidometr: sürülən km və yanacaq pulu">
      {/* Tarix render zamanı oxunur: Next 16 bunu Suspense daxilində tələb edir */}
      <Suspense fallback={<Card className="muted">Yüklənir...</Card>}>
        <Content />
      </Suspense>
    </Page>
  );
}
