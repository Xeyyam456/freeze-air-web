import { Clock, MapPin, Phone } from "lucide-react";
import { getContact, telHref } from "@/lib/site-settings";
import type { TextsProps } from "@/types/site";
import { ContactCard } from "./ContactCard";

// Sürətli əlaqə bloku: məlumatlar bazadan (admin panelində "Sayt")
export async function QuickContact({ t }: TextsProps) {
  const c = await getContact();
  const items = [
    { icon: Phone, label: t["home.contact.phone"], value: c.phone, href: telHref(c.phone) },
    { icon: MapPin, label: t["home.contact.address"], value: c.address },
    { icon: Clock, label: t["home.contact.hours"], value: c.hours },
  ];
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(c.address)}&z=13&output=embed&hl=az`;

  return (
    <>
      <ContactCard t={t} items={items} />
      <div className="overflow-hidden rounded-[28px] bg-white">
        <iframe src={mapUrl} title={`Xəritə: ${c.address}`} className="h-full min-h-[360px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    </>
  );
}
