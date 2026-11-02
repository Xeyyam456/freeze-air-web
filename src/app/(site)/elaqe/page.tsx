import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactCards } from "@/views/Site/Contact/components/ContactCards";
import { PageIntro } from "@/components/landing/PageIntro";
import { pageTitle } from "@/lib/site-texts";
import { getTexts } from "@/services/site/fetchSiteTexts.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle("contact.title") };
}

export default async function ContactPage() {
  const t = await getTexts();
  return (
    <>
      <PageIntro title={t["contact.title"]} lead={t["contact.lead"]} />
      <Suspense fallback={<div className="site-wrap"><div className="h-[520px] rounded-[32px] bg-white/60" /></div>}>
        <ContactCards t={t} />
      </Suspense>
    </>
  );
}
