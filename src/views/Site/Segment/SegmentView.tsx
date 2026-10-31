import { notFound } from "next/navigation";
import { PageIntro } from "@/components/landing/PageIntro";
import { getEquipment, getSegments, segmentEquipment } from "@/lib/site-content";
import { getTexts } from "@/lib/site-texts";
import type { SegmentViewProps } from "@/types/site";
import { EquipmentCards } from "./components/EquipmentCards";
import { IssuesWork } from "./components/IssuesWork";
import { OtherSegments } from "./components/OtherSegments";
import { SegmentHero } from "./components/SegmentHero";
import { SegmentNote } from "./components/SegmentNote";

// Obyekt növünə görə ayrıca xidmət səhifəsi (məzmun bazadan, admin panelində "Sayt" → Obyektlər)
export async function SegmentView({ slug }: SegmentViewProps) {
  const [segments, allEquipment, t] = await Promise.all([getSegments(), getEquipment(), getTexts()]);
  const segment = segments.find((s) => s.slug === slug);
  if (!segment) notFound();

  const equipment = segmentEquipment(segment, allEquipment);

  return (
    <>
      <PageIntro title={segment.title} lead={segment.lead} parent={{ href: "/xidmetler", label: t["nav.services"] }} />
      <SegmentHero segment={segment} equipment={equipment} t={t} />
      <EquipmentCards equipment={equipment} t={t} />
      <IssuesWork segment={segment} equipment={equipment} t={t} />
      <SegmentNote segment={segment} equipment={equipment} t={t} />
      <OtherSegments others={segments.filter((s) => s.id !== segment.id)} t={t} />
    </>
  );
}
