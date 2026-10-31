import type { Metadata } from "next";
import { Suspense } from "react";
import { getServices } from "@/lib/site-content";
import { getTexts } from "@/lib/site-texts";
import { ServiceView } from "@/views/Site/Service/ServiceView";

// Hər xidmətin məlumat səhifəsi (məzmun bazadan: admin panelində "Sayt" → Xidmətlər → redaktə)
export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/xidmet/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [services, t] = await Promise.all([getServices(), getTexts()]);
  const s = services.find((x) => x.slug === slug);
  return { title: s ? `${s.title} — ${t["brand.name"]}` : t["brand.name"], description: s?.lead || s?.text };
}

// params Suspense daxilində oxunur (Next 16: səhifənin qalanı dərhal göstərilsin)
export default function ServicePage({ params }: PageProps<"/xidmet/[slug]">) {
  return (
    <Suspense fallback={<div className="site-wrap py-20 text-night/50">Yüklənir...</div>}>
      {params.then(({ slug }) => <ServiceView slug={slug} />)}
    </Suspense>
  );
}
