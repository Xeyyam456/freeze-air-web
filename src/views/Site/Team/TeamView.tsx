import { Suspense } from "react";
import { PageIntro } from "@/components/landing/PageIntro";
import { getTexts } from "@/lib/site-texts";
import { TeamSection } from "./components/TeamSection";

export async function TeamView() {
  const t = await getTexts();
  return (
    <>
      <PageIntro title={t["team.title"]} lead={t["team.lead"]} />
      <Suspense fallback={<div className="site-wrap"><div className="h-96 rounded-[32px] bg-white/60" /></div>}>
        <TeamSection t={t} />
      </Suspense>
    </>
  );
}
