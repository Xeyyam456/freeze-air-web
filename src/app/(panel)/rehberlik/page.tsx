import { Suspense } from "react";
import { Page } from "@/components/Page";
import { ManagerList } from "@/components/management/ManagerList";
import { createClient } from "@/lib/supabase/server";

// Rəhbərlik: yalnız baxış; karta klik məlumat pəncərəsini açır
async function Content() {
  const supabase = await createClient();
  const { data: managers } = await supabase
    .from("employees")
    .select("*")
    .eq("is_management", true)
    .eq("is_active", true)
    .order("full_name");

  return <ManagerList managers={managers ?? []} />;
}

export default function ManagementPage() {
  return (
    <Page title="Rəhbərlik" subtitle="Müdir, servis müdirləri və maliyyəçi">
      <Suspense fallback={<div className="card muted">Yüklənir...</div>}>
        <Content />
      </Suspense>
    </Page>
  );
}
