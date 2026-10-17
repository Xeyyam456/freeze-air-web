import { Suspense } from "react";
import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { EmployeeList, type HeldTool } from "@/components/employees/EmployeeList";
import { createClient } from "@/lib/supabase/server";

// Bu günün tarixi Bakı vaxtı ilə ("YYYY-MM-DD"): server başqa saat qurşağında ola bilər
function todayBaku() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" }).format(new Date());
}

async function Content() {
  const supabase = await createClient();
  const [{ data: employees }, { data: assignments }, { data: myEmployeeId }, { data: todayLogs }] = await Promise.all([
    supabase.from("employees").select("*").eq("is_management", false).eq("is_active", true).order("full_name"),
    // Hazırda ustalarda olan alətlər (qaytarılmamış)
    supabase
      .from("tool_assignments")
      .select("employee_id, quantity, taken_at, tools(id, name, inventory_code, kind, unit)")
      .is("returned_at", null)
      .order("taken_at"),
    // Daxil olmuş istifadəçinin usta qeydi: öz kartı seçilir, işlərini yalnız özü əlavə edir
    supabase.rpc("my_employee_id"),
    // Bu gün yazılan işlər: kartda say göstərilir
    supabase.from("work_logs").select("employee_id").eq("work_date", todayBaku()),
  ]);

  const todayWork: Record<number, number> = {};
  for (const l of todayLogs ?? []) todayWork[l.employee_id] = (todayWork[l.employee_id] ?? 0) + 1;

  const toolsByEmployee: Record<number, HeldTool[]> = {};
  for (const a of assignments ?? []) {
    if (!a.tools) continue;
    (toolsByEmployee[a.employee_id] ??= []).push({ ...a.tools, quantity: a.quantity, taken_at: a.taken_at });
  }

  return (
    <WithSidePanel>
      <EmployeeList employees={employees ?? []} toolsByEmployee={toolsByEmployee} todayWork={todayWork} myEmployeeId={myEmployeeId ?? null} />
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
