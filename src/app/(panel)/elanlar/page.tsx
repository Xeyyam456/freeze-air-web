import { Suspense } from "react";
import { Page } from "@/components/Page";
import { Prefetch } from "@/components/panel/Prefetch";
import { Card } from "@/shared/components/Card";
import { AnnouncementsView } from "@/views/Announcements";
import { prefetchAnnouncements } from "@/views/Announcements/queries/prefetchAnnouncements.server";

// Elanlar: rəhbərliyin bütün komandaya elanları ("sabah saat 9-da iclas"); bildirişə toxunanda bura açılır. Məlumat serverdə əvvəlcədən (Prefetch).
// Siyahı tarixi render zamanı oxuyur ("Bu gün", "Yeni"): Next 16 bunu Suspense daxilində tələb edir
export default function AnnouncementsPage() {
  return (
    <Page title="Elanlar" subtitle="Rəhbərliyin bütün komandaya elanları">
      <Suspense fallback={<Card className="muted py-10 text-center text-sm">Yüklənir...</Card>}>
        <Prefetch load={prefetchAnnouncements}>
          <AnnouncementsView />
        </Prefetch>
      </Suspense>
    </Page>
  );
}
