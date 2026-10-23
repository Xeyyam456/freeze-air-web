import { Suspense } from "react";
import { Page } from "@/components/Page";
import { MyDay } from "@/components/work/MyDay";
import { WorkHistory } from "@/components/work/WorkHistory";

const loading = <p className="muted text-sm">Yüklənir...</p>;

export default function Home() {
  return (
    <Page title="Panel" subtitle="Mənim bugünüm və görülən işlər">
      <div className="flex h-[calc(100vh-var(--header-h)-2*var(--gap))] flex-col gap-5">
        {/* Üst sıra: mənim bugünüm (depo kartı 2026-10-24 çıxarıldı: "Kimdə nə var" Alətlərim-dədir) */}
        <div className="shrink-0">
          {/* MyDay render zamanı tarixi oxuyur (davamiyyət): Next 16 bunu Suspense daxilində tələb edir */}
          <Suspense fallback={<div className="card h-[118px]" />}>
            <MyDay />
          </Suspense>
        </div>
        {/* Görülən işlər (tarixçə) tam endə; tarix render zamanı oxunur (new Date): Suspense daxilində */}
        <section className="card flex min-h-0 flex-1 flex-col">
          <Suspense fallback={loading}>
            <WorkHistory />
          </Suspense>
        </section>
      </div>
    </Page>
  );
}
