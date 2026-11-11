import { Suspense } from "react";
import { PageIntro } from "@/components/landing/PageIntro";
import { getTexts } from "@/services/site/fetchSiteTexts.server";
import { TeamSection } from "./components/TeamSection";

export async function TeamView() {
  const t = await getTexts();
  return (
    <div className="bg-[radial-gradient(42%_30%_at_4%_15%,rgba(0,163,217,0.13),transparent),radial-gradient(38%_30%_at_98%_45%,rgba(255,159,28,0.11),transparent),radial-gradient(40%_28%_at_12%_92%,rgba(31,111,235,0.09),transparent)]">
      <PageIntro title={t["team.title"]} lead={t["team.lead"]} />
      <Suspense fallback={<div className="site-wrap"><div className="h-96 rounded-[32px] bg-white/60" /></div>}>
        <TeamSection t={t} />
      </Suspense>
    </div>
  );
}
