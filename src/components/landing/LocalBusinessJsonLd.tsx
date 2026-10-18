import { getContact } from "@/lib/site-settings";
import { getTexts } from "@/lib/site-texts";
import { SITE_URL } from "@/lib/site-url";

// Google üçün "yerli biznes" strukturlu məlumatı (telefon, ünvan, e-poçt admin paneldəki əlaqə məlumatından gəlir; iş saatları sərbəst mətndir, schema formatında deyil, ona görə göndərilmir).
// Doldurulmamış yer tutucular (XX) göndərilmir.
export async function LocalBusinessJsonLd() {
  const [contact, t] = await Promise.all([getContact(), getTexts()]);
  const filled = (v: string) => (v && !/XX|yazılacaq/.test(v) ? v : undefined);

  const data = {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    name: t["brand.name"],
    url: SITE_URL,
    telephone: filled(contact.phone),
    email: contact.email ?? undefined,
    address: filled(contact.address) && { "@type": "PostalAddress", streetAddress: contact.address, addressCountry: "AZ" },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}
