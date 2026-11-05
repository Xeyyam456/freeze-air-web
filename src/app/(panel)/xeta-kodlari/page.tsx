import { Suspense } from "react";
import { Page } from "@/components/Page";
import { Prefetch } from "@/components/panel/Prefetch";
import { WithSidePanel } from "@/components/SidePanel";
import { Card } from "@/shared/components/Card";
import { ErrorCodesView } from "@/views/ErrorCodes";
import { prefetchErrorCodes } from "@/views/ErrorCodes/queries/prefetchErrorCodes.server";

// Xəta kodları: modellər və kodlar serverdə əvvəlcədən (Prefetch) — pult və xəritə açılan an dolu
export default function ErrorCodesPage() {
  return (
    <Page title="Xəta kodları" subtitle="Pultdakı kodu yaz: izahı və edilecək iş">
      <WithSidePanel>
        {/* Cookie render zamanı oxunur: Next 16 bunu Suspense daxilində tələb edir */}
        <Suspense fallback={<Card className="muted">Yüklənir...</Card>}>
          <Prefetch load={prefetchErrorCodes}>
            <ErrorCodesView />
          </Prefetch>
        </Suspense>
      </WithSidePanel>
    </Page>
  );
}
