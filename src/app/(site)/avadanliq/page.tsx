import type { Metadata } from "next";
import { Suspense } from "react";
import { EquipmentVisual } from "@/components/landing/EquipmentVisual";
import { PageIntro } from "@/components/landing/PageIntro";
import { getEquipment } from "@/lib/site-content";
import { getTexts, pageTitle } from "@/lib/site-texts";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("equipment.title") };
}

// Avadanlıq növləri bazadan (admin panelində "Sayt" → Avadanlıq).
// Bütün kartlar eyni ölçüdə (geniş ekranda 5-i bir sırada). Şəkillər 16:9.
async function EquipmentGrid() {
  const items = await getEquipment();
  return (
    <section className="site-wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((e) => (
        <article key={e.id} className="flex flex-col rounded-[28px] bg-white p-5">
          <div className="aspect-video overflow-hidden rounded-[20px]">
            <EquipmentVisual item={e} />
          </div>
          <h2 className="mt-5 font-display text-xl font-bold">{e.title}</h2>
          {e.text && <p className="mt-2 text-night/65">{e.text}</p>}
          {e.place && <p className="mt-auto pt-4 text-sm font-semibold text-cold">{e.place}</p>}
        </article>
      ))}
    </section>
  );
}

export default async function EquipmentPage() {
  const t = await getTexts();
  return (
    <>
      <PageIntro title={t["equipment.title"]} lead={t["equipment.lead"]} />
      <Suspense fallback={<div className="site-wrap"><div className="h-96 rounded-[28px] bg-white/60" /></div>}>
        <EquipmentGrid />
      </Suspense>
    </>
  );
}
