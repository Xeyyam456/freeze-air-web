import type { Metadata } from "next";
import { Suspense } from "react";
import { EquipmentShowcase } from "@/views/Site/Equipment/components/EquipmentShowcase";
import { PageIntro } from "@/components/landing/PageIntro";
import { getEquipment } from "@/lib/site-content";
import { getTexts, pageTitle } from "@/lib/site-texts";

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
    <>
      <PageIntro title={t["equipment.title"]} lead={t["equipment.lead"]} />
      <Suspense fallback={<div className="site-wrap pb-20"><div className="h-[520px] rounded-[32px] bg-white/60" /></div>}>
        <EquipmentGrid />
      </Suspense>
    </>
  );
}
