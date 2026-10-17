import { Page } from "@/components/Page";
import { WithSidePanel } from "@/components/SidePanel";
import { ErrorCodeView } from "@/components/errors/ErrorCodeView";

export default function ErrorCodesPage() {
  return (
    <Page title="Xəta kodları" subtitle="Kondisioner modeli, xəta kodu, açıqlama və edilecək iş">
      <WithSidePanel>
        <ErrorCodeView />
      </WithSidePanel>
    </Page>
  );
}
