import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { ErrorCodesView } from "@/views/ErrorCodes";

export default function ErrorCodesPage() {
  return (
    <Page title="Xəta kodları" subtitle="Pultdakı kodu yaz: izahı və edilecək iş">
      <WithSidePanel>
        <ErrorCodesView />
      </WithSidePanel>
    </Page>
  );
}
