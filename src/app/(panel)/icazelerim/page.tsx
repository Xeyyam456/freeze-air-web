import { Suspense } from "react";
import { Page } from "@/components/Page";
import { Prefetch } from "@/components/panel/Prefetch";
import { MyLeaves } from "@/views/Leaves/components/MyLeaves";
import { prefetchMyLeaves } from "@/views/Leaves/queries/prefetchMyLeaves.server";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/components/Card";

// İcazələrim: ustanın öz icazə sorğuları (aktiv, gözləyən, tarixçə); "İcazə istə" qlobal pəncərəni açır (QuickActions). Sorğular serverdə əvvəlcədən (Prefetch)
async function Content() {
  const supabase = await createClient();
  const { data: me } = await supabase.rpc("my_employee_id");
  const id = me ?? null;
  return (
    <Prefetch load={(db) => prefetchMyLeaves(db, id)}>
      <MyLeaves employeeId={id} />
    </Prefetch>
  );
}

export default function MyLeavesPage() {
  return (
    <Page title="İcazələrim" subtitle="İcazə sorğularım: gözləyən, təsdiqlənən və tarixçə">
      {/* Tarix render zamanı oxunur: Next 16 bunu Suspense daxilində tələb edir */}
      <Suspense fallback={<Card className="muted">Yüklənir...</Card>}>
        <Content />
      </Suspense>
    </Page>
  );
}
