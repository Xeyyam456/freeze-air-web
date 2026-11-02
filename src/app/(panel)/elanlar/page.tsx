import { Page } from "@/components/Page";
import { AnnouncementsView } from "@/views/Announcements/components/AnnouncementsView";

// Elanlar: rəhbərliyin bütün komandaya elanları ("sabah saat 9-da iclas"); bildirişə toxunanda bura açılır
export default function AnnouncementsPage() {
  return (
    <Page title="Elanlar" subtitle="Rəhbərliyin bütün komandaya elanları">
      <AnnouncementsView />
    </Page>
  );
}
