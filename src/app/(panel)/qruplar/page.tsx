import { Page } from "@/components/Page";
import { FeedView } from "@/views/Feed";

// Qruplar: ustaların tapşırıq qeydinə yüklədiyi şəkil, video və aktlar (usta + yer ilə), reaksiya və şərhlər. Brauzerdə yüklənir, canlıdır.
export default function GroupsPage() {
  return (
    <Page title="Qruplar" subtitle="Görülən işlər və aktlar">
      <FeedView />
    </Page>
  );
}
