import type { Metadata } from "next";
import { Suspense } from "react";
import { EquipmentShowcase } from "@/views/Site/Equipment/components/EquipmentShowcase";
import { PageIntro } from "@/components/landing/PageIntro";
import { getEquipment } from "@/services/site/fetchSiteContent.server";
import { pageTitle } from "@/lib/site-texts";
import { getTexts } from "@/services/site/fetchSiteTexts.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("equipment.title") };
}

// Avadanlıq növləri bazadan (admin panelində "Sayt" → Avadanlıq): solda siyahı, sağda seçilənin böyük səhnəsi
async function EquipmentGrid() {
  const items = await getEquipment();
  return (
    <section className="site-wrap pb-20">
      <EquipmentShowcase items={items.map(({ id, key, title, text, place, image_url }) => ({ id, key, title, text, place, image_url }))} />
    </section>
  );
}

export default async function EquipmentPage() {
  const t = await getTexts();
  return (
    <div className="bg-[radial-gradient(42%_14%_at_4%_14%,rgba(0,163,217,0.13),transparent),radial-gradient(38%_14%_at_98%_45%,rgba(255,159,28,0.11),transparent),radial-gradient(40%_14%_at_10%_80%,rgba(31,111,235,0.09),transparent)]">
      <PageIntro title={t["equipment.title"]} lead={t["equipment.lead"]} />
      <Suspense fallback={<div className="site-wrap pb-20"><div className="h-[520px] rounded-[32px] bg-white/60" /></div>}>
        <EquipmentGrid />
      </Suspense>
    </div>
  );
}
