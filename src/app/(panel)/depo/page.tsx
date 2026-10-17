import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Page } from "@/components/Page";
import { DepotShell, type Holding } from "@/components/depot/DepotView";
import { createClient } from "@/lib/supabase/server";

// Depo yalnız depo məsulu (və müdir) üçündür: başqası bu ünvana girsə panelə qayıdır.
// Yazma yetkisi bazadadır (can_manage_tools()), burada yalnız görünüş.
async function Content() {
  const supabase = await createClient();
  const { data: canManage } = await supabase.rpc("can_manage_tools");
  if (!canManage) redirect("/panel");

  const [{ data: tools }, { data: holdings }, { data: employees }] = await Promise.all([
    supabase.from("tool_stock").select("*").order("name"),
    supabase.from("tool_assignments")
      .select("id, tool_id, employee_id, quantity, taken_at, employees(full_name, photo_url)")
      .is("returned_at", null)
      .order("taken_at"),
    // Alət yalnız ustaya verilir
    supabase.from("employees").select("id, full_name, photo_url, is_management").eq("is_management", false).eq("is_active", true).order("full_name"),
  ]);

  return (
    <DepotShell tools={tools ?? []} holdings={(holdings ?? []) as Holding[]} employees={employees ?? []} />
  );
}

export default function DepotPage() {
  return (
    <Page title="Depo" subtitle="Alətlər və materiallar, sayı və kimdə olduğu">
      <Suspense fallback={<div className="card muted">Yüklənir...</div>}>
        <Content />
      </Suspense>
    </Page>
  );
}
