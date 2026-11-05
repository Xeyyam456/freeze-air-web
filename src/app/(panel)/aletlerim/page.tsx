import { Suspense } from "react";
import { Page } from "@/components/Page";
import { Prefetch } from "@/components/panel/Prefetch";
import { MyTools } from "@/views/MyTools/components/MyTools";
import { prefetchMyTools } from "@/views/MyTools/queries/prefetchMyTools.server";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/components/Card";

// Alətlərim: ustanın üzərindəki alət və materiallar; "Aldım / Almadım", qaytarma və alət istəmə sorğuları (0084).
// Məlumat serverdə əvvəlcədən (Prefetch)
async function Content() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_employee_id");
  const me = data ?? null;
  return (
    <Prefetch load={(db) => prefetchMyTools(db, me)}>
      <MyTools employeeId={me} />
    </Prefetch>
  );
}

export default function MyToolsPage() {
  return (
    <Page title="Alətlərim" subtitle="Üzərimdəki alət və materiallar: təsdiqlə, qaytar, istə">
      <Suspense fallback={<Card className="muted">Yüklənir...</Card>}>
        <Content />
      </Suspense>
    </Page>
  );
}
