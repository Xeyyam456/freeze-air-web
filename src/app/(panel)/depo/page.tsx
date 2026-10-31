import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DepotPage } from "@/views/Depot";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/components/Card";

// Depo yalnız depo məsulu (və adminlər) üçündür: başqası bu ünvana girsə panelə qayıdır.
// Yazma yetkisi bazadadır (can_manage_tools(), 0084); məlumat brauzerdə yüklənir və hər əməliyyatdan sonra yenilənir.
async function Gate() {
  const supabase = await createClient();
  const [{ data: canManage }, { data: owner }, { data: claims }] = await Promise.all([
    supabase.rpc("can_manage_tools"),
    supabase.rpc("is_owner"),
    supabase.auth.getClaims(),
  ]);
  if (!canManage) redirect("/panel");
  return <DepotPage myUid={claims?.claims.sub ? String(claims.claims.sub) : null} owner={owner === true} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="app-shell app-main"><Card className="muted">Yüklənir...</Card></div>}>
      <Gate />
    </Suspense>
  );
}
