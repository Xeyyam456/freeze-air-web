import type { Metadata } from "next";
import { Suspense } from "react";
import { getSegments } from "@/lib/site-content";
import { getTexts } from "@/lib/site-texts";
import { SegmentView } from "@/views/Site/Segment/SegmentView";

// Obyekt növünə görə ayrıca xidmət səhifəsi (məzmun bazadan, admin panelində "Sayt" → Obyektlər)
export async function generateStaticParams() {
  const segments = await getSegments();
  return segments.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/xidmetler/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [segments, t] = await Promise.all([getSegments(), getTexts()]);
  const s = segments.find((x) => x.slug === slug);
  return { title: s ? `${s.title} — ${t["brand.name"]}` : t["brand.name"] };
}

// params Suspense daxilində oxunur (Next 16: səhifənin qalanı dərhal göstərilsin)
export default function SegmentPage({ params }: PageProps<"/xidmetler/[slug]">) {
  return (
    <Suspense fallback={<div className="site-wrap py-20 text-night/50">Yüklənir...</div>}>
      {params.then(({ slug }) => <SegmentView slug={slug} />)}
    </Suspense>
  );
}
