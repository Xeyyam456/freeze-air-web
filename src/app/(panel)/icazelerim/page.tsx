import { Suspense } from "react";
import { Page } from "@/components/Page";
import { MyLeaves } from "@/components/work/MyLeaves";
import { createClient } from "@/lib/supabase/server";

// İcazələrim: ustanın öz icazə sorğuları (aktiv, gözləyən, tarixçə); "İcazə istə" qlobal pəncərəni açır (QuickActions)
async function Content() {
  const supabase = await createClient();
  const { data: me } = await supabase.rpc("my_employee_id");
  return <MyLeaves employeeId={me ?? null} />;
}

export default function MyLeavesPage() {
  return (
    <Page title="İcazələrim" subtitle="İcazə sorğularım: gözləyən, təsdiqlənən və tarixçə">
      {/* Tarix render zamanı oxunur: Next 16 bunu Suspense daxilində tələb edir */}
      <Suspense fallback={<div className="card muted">Yüklənir...</div>}>
        <Content />
      </Suspense>
    </Page>
  );
}
