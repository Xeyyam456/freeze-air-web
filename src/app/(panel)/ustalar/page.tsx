import { Suspense } from "react";
import { Page } from "@/components/Page";
import { fetchEmployees } from "@/services/employees/fetchEmployees.server";
import { todayBaku } from "@/shared/utils/todayBaku";
import { EmployeeList } from "@/views/Employees/components/EmployeeList";
import { employeesView } from "@/views/Employees/utils/employeesView";

async function Content() {
  const raw = await fetchEmployees();
  return <EmployeeList {...employeesView(raw, todayBaku())} />;
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
