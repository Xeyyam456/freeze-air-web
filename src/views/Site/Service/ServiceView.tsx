import { notFound } from "next/navigation";
import { PageIntro } from "@/components/landing/PageIntro";
import { getServices } from "@/services/site/fetchSiteContent.server";
import { getContact } from "@/services/site/fetchSiteSettings.server";
import { telHref, whatsappHref } from "@/shared/utils/phone";
import { getTexts } from "@/services/site/fetchSiteTexts.server";
import type { ServiceViewProps } from "@/types/site";
import { OtherServices } from "./components/OtherServices";
import { ServiceAside } from "./components/ServiceAside";
import { ServiceBody } from "./components/ServiceBody";

// Xidmətin məlumat səhifəsi: solda məzmun, sağda çağırış; altda digər xidmətlər
export async function ServiceView({ slug }: ServiceViewProps) {
  const [services, t, contact] = await Promise.all([getServices(), getTexts(), getContact()]);
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <div className="bg-[radial-gradient(42%_12%_at_4%_14%,rgba(0,163,217,0.13),transparent),radial-gradient(38%_12%_at_98%_45%,rgba(255,159,28,0.11),transparent),radial-gradient(40%_12%_at_10%_85%,rgba(31,111,235,0.09),transparent)]">
      <PageIntro title={service.title} lead={service.lead || service.text} parent={{ href: "/xidmetler", label: t["nav.services"] }} />

      <section className="site-wrap grid items-start gap-4 lg:grid-cols-[1.6fr_1fr]">
        <ServiceBody service={service} t={t} />
        <ServiceAside service={service} t={t} phone={contact.phone} hours={contact.hours} tel={telHref(contact.phone)} wa={whatsappHref(contact.phone)} />
      </section>

      <OtherServices others={services.filter((s) => s.id !== service.id)} t={t} />
    </div>
  );
}
