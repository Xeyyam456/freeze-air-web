import { Suspense } from "react";
import { Page } from "@/components/Page";
import { AttendanceBoard } from "@/views/Attendance/components/AttendanceBoard";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/components/Card";

// Davamiyyət: bütün ustaların ay üzrə gəlməsi, icazəsi (öz sətrin birinci). "İşə gəldim / İşi bitirdim / İcazə istə" Panel-dədir.
async function Content() {
  const supabase = await createClient();
  const { data: me } = await supabase.rpc("my_employee_id");
  return <AttendanceBoard meId={me ?? null} />;
}

export default function AttendancePage() {
  return (
    <Page title="Davamiyyət" subtitle="Ay üzrə: işdə, icazəli, gəlmədi; gəlmə və getmə saatları">
      {/* Tarix render zamanı oxunur: Next 16 bunu Suspense daxilində tələb edir */}
      <Suspense fallback={<Card className="muted">Yüklənir...</Card>}>
        <Content />
      </Suspense>
    </Page>
  );
}
