import { Suspense } from "react";
import { Page } from "@/components/Page";
import { EmployeeList, type TodayStatus } from "@/components/employees/EmployeeList";
import { monthStartBaku } from "@/components/clients/stats";
import { fetchAll } from "@/lib/fetchAll";
import { createClient } from "@/lib/supabase/server";

// Bu günün tarixi Bakı vaxtı ilə ("YYYY-MM-DD"): server başqa saat qurşağında ola bilər
function todayBaku() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" }).format(new Date());
}

// "2026-10-23T05:02:00Z" → Bakı saatı "09:02"
function timeBaku(iso: string) {
  return new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

async function Content() {
  const supabase = await createClient();
  const today = todayBaku();
  const [{ data: employees }, { data: myEmployeeId }, { data: monthLogs }, { data: attendance }, { data: leaves }] = await Promise.all([
    supabase.from("employees").select("*").eq("is_management", false).eq("is_active", true).order("full_name"),
    // Daxil olmuş istifadəçinin usta qeydi: öz kartı seçilir, işlərini yalnız özü əlavə edir
    supabase.rpc("my_employee_id"),
    // Bu ayın işləri: kartda "bu gün" və "bu ay" sayı
    // ayda 1000-dən çox iş ola bilər: hissələrlə (fetchAll)
    fetchAll((a, b) => supabase.from("work_logs").select("id, employee_id, work_date").gte("work_date", monthStartBaku()).order("id").range(a, b)).then((data) => ({ data })),
    // Bu günün davamiyyəti (bir gündə bir neçə seans ola bilər) və təsdiqlənmiş icazələr
    supabase.from("attendance").select("employee_id, checked_in_at, checked_out_at").eq("day", today),
    supabase.from("leave_requests").select("employee_id").eq("status", "approved").lte("date_from", today).gte("date_to", today),
  ]);

  const todayWork: Record<number, number> = {};
  const monthWork: Record<number, number> = {};
  for (const l of monthLogs ?? []) {
    monthWork[l.employee_id] = (monthWork[l.employee_id] ?? 0) + 1;
    if (l.work_date === today) todayWork[l.employee_id] = (todayWork[l.employee_id] ?? 0) + 1;
  }

  // Bu günkü vəziyyət: işdədir (açıq seans) → işi bitirib → icazəli → bazar → hələ gəlməyib
  const sunday = new Date(`${today}T12:00:00Z`).getUTCDay() === 0;
  const onLeave = new Set((leaves ?? []).map((l) => l.employee_id));
  const status: Record<number, TodayStatus> = {};
  for (const e of employees ?? []) {
    const rows = (attendance ?? []).filter((a) => a.employee_id === e.id).sort((a, b) => a.checked_in_at.localeCompare(b.checked_in_at));
    const open = rows.find((a) => !a.checked_out_at);
    if (open) status[e.id] = { kind: "in", text: `İşdədir · ${timeBaku(rows[0].checked_in_at)}-dən` };
    else if (rows.length) status[e.id] = { kind: "done", text: `İşi bitirib · ${timeBaku(rows.at(-1)!.checked_out_at!)}` };
    else if (onLeave.has(e.id)) status[e.id] = { kind: "leave", text: "İcazəlidir" };
    else status[e.id] = { kind: "none", text: sunday ? "Bazar günü" : "Hələ gəlməyib" };
  }

  return (
    <EmployeeList employees={employees ?? []} todayWork={todayWork} monthWork={monthWork} status={status} myEmployeeId={myEmployeeId ?? null} />
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
