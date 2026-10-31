import { Suspense } from "react";
import { Page } from "@/components/Page";
import { MyTools } from "@/views/MyTools/components/MyTools";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/components/Card";

// Alətlərim: ustanın üzərindəki alət və materiallar; "Aldım / Almadım", qaytarma və alət istəmə sorğuları (0084)
async function Content() {
  const supabase = await createClient();
  const { data: me } = await supabase.rpc("my_employee_id");
  return <MyTools employeeId={me ?? null} />;
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
