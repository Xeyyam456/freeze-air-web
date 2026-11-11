import { Suspense } from "react";
import { PageIntro } from "@/components/landing/PageIntro";
import { Reveal } from "@/components/landing/Reveal";
import { getTexts } from "@/services/site/fetchSiteTexts.server";
import { SegmentTiles } from "./components/SegmentTiles";
import { ServiceList } from "./components/ServiceList";
import { ServicesCta } from "./components/ServicesCta";

const TILE = "aspect-[4/5] rounded-[28px] bg-white/60 max-lg:aspect-[4/3] lg:max-2xl:aspect-[16/9]";

// Xidmətlər: obyekt növləri (hər biri ayrıca səhifə) və bütün xidmətlər
export async function ServicesView() {
  const t = await getTexts();
  return (
    <div className="bg-[radial-gradient(42%_14%_at_4%_14%,rgba(0,163,217,0.13),transparent),radial-gradient(38%_14%_at_98%_45%,rgba(255,159,28,0.11),transparent),radial-gradient(40%_14%_at_10%_80%,rgba(31,111,235,0.09),transparent)]">
      <PageIntro title={t["services.title"]} lead={t["services.lead"]} />

      <section className="site-wrap">
        <Reveal>
          <h2 className="mb-8 font-display text-3xl font-bold max-sm:text-center sm:text-4xl">{t["services.segments"]}</h2>
        </Reveal>
        <Suspense fallback={<div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className={TILE} />)}</div>}>
          <SegmentTiles />
        </Suspense>
      </section>

      <section className="site-wrap mt-20">
        <Reveal>
          <h2 className="mb-8 font-display text-3xl font-bold max-sm:text-center sm:text-4xl">{t["services.list"]}</h2>
        </Reveal>
        <Suspense fallback={<div className="h-96 rounded-[32px] bg-white/60" />}>
          <ServiceList />
        </Suspense>
        <ServicesCta t={t} />
      </section>
    </div>
  );
}
