import { Suspense } from "react";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { createClient } from "@/lib/supabase/server";

// Bu günün tarixi Bakı vaxtı ilə ("YYYY-MM-DD"): server başqa saat qurşağında ola bilər
function todayBaku() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" }).format(new Date());
}

async function Content() {
  const supabase = await createClient();
  const [{ data: employees }, { data: myEmployeeId }, { data: todayLogs }] = await Promise.all([
    supabase.from("employees").select("*").eq("is_management", false).eq("is_active", true).order("full_name"),
    // Daxil olmuş istifadəçinin usta qeydi: öz kartı seçilir, işlərini yalnız özü əlavə edir
    supabase.rpc("my_employee_id"),
    // Bu gün yazılan işlər: kartda say göstərilir
    supabase.from("work_logs").select("employee_id").eq("work_date", todayBaku()),
  ]);

  const todayWork: Record<number, number> = {};
  for (const l of todayLogs ?? []) todayWork[l.employee_id] = (todayWork[l.employee_id] ?? 0) + 1;

  return (
    <WithSidePanel>
      <EmployeeList employees={employees ?? []} todayWork={todayWork} myEmployeeId={myEmployeeId ?? null} />
    </WithSidePanel>
  );
}

export default function EmployeesPage() {
  return (
    <Page title="Ustalar" subtitle="Ustaların ixtisası, təcrübəsi və əlaqə məlumatı">
      <Suspense fallback={<div className="card muted">Yüklənir...</div>}>
        <Content />
      </Suspense>
    </Page>
  );
}
