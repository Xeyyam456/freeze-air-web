import { notFound } from "next/navigation";
import { PageIntro } from "@/components/landing/PageIntro";
import { tone } from "@/components/landing/tones";
import { segmentEquipment } from "@/lib/site-content";
import { getEquipment, getSegments } from "@/services/site/fetchSiteContent.server";
import { getTexts } from "@/services/site/fetchSiteTexts.server";
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
  const toneOf = Object.fromEntries(segments.map((s, i) => [s.id, i]));

  return (
    <div style={tone(toneOf[segment.id])} className="bg-[radial-gradient(42%_12%_at_4%_14%,rgba(0,163,217,0.13),transparent),radial-gradient(38%_12%_at_98%_45%,rgba(255,159,28,0.11),transparent),radial-gradient(40%_12%_at_10%_85%,rgba(31,111,235,0.09),transparent)]">
      <PageIntro title={segment.title} lead={segment.lead} parent={{ href: "/xidmetler", label: t["nav.services"] }} />
      <SegmentHero segment={segment} equipment={equipment} t={t} />
      <EquipmentCards equipment={equipment} t={t} />
      <IssuesWork segment={segment} equipment={equipment} t={t} />
      <SegmentNote segment={segment} equipment={equipment} t={t} />
      <OtherSegments others={segments.filter((s) => s.id !== segment.id)} toneOf={toneOf} t={t} />
    </div>
  );
}
