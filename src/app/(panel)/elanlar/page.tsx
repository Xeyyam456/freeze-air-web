import { Suspense } from "react";
import { Page } from "@/components/Page";
import { Card } from "@/shared/components/Card";
import { AnnouncementsView } from "@/views/Announcements/components/AnnouncementsView";

// Elanlar: rəhbərliyin bütün komandaya elanları ("sabah saat 9-da iclas"); bildirişə toxunanda bura açılır.
// Siyahı tarixi render zamanı oxuyur ("Bu gün", "Yeni"): Next 16 bunu Suspense daxilində tələb edir
export default function AnnouncementsPage() {
  return (
    <Page title="Elanlar" subtitle="Rəhbərliyin bütün komandaya elanları">
      <Suspense fallback={<Card className="muted py-10 text-center text-sm">Yüklənir...</Card>}>
        <AnnouncementsView />
      </Suspense>
    </Page>
  );
}
