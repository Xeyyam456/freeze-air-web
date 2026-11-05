import { Suspense } from "react";
import { Page } from "@/components/Page";
import { Prefetch } from "@/components/panel/Prefetch";
import { AttendanceBoard } from "@/views/Attendance/components/AttendanceBoard";
import { prefetchAttendance } from "@/views/Attendance/queries/prefetchAttendance.server";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/shared/components/Card";

// Davamiyyət: bütün ustaların ay üzrə gəlməsi, icazəsi (öz sətrin birinci). "İşə gəldim / İşi bitirdim / İcazə istə" Panel-dədir.
// Məlumat serverdə əvvəlcədən (Prefetch)
async function Content() {
  const supabase = await createClient();
  const { data: me } = await supabase.rpc("my_employee_id");
  return (
    <Prefetch load={prefetchAttendance}>
      <AttendanceBoard meId={me ?? null} />
    </Prefetch>
  );
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
