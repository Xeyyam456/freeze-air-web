import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getContact, telHref } from "@/lib/site-settings";
import { CONTACT_LINK } from "../constants/footerStyles";

// Əlaqə sətirləri: telefon, ünvan (xəritədə açılır), saat, e-poçt
export async function FooterContact() {
  const c = await getContact();
  const tel = telHref(c.phone);
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`;
  return (
    <>
      <li>{tel
        ? <a href={tel} className={CONTACT_LINK}><Phone size={18} className="mt-0.5 shrink-0 text-cold" /> {c.phone}</a>
        : <span className="flex gap-3"><Phone size={18} className="mt-0.5 shrink-0 text-cold" /> {c.phone}</span>}</li>
      <li><a href={map} target="_blank" rel="noopener noreferrer" className={CONTACT_LINK}><MapPin size={18} className="mt-0.5 shrink-0 text-cold" /> {c.address}</a></li>
      <li className="flex gap-3"><Clock size={18} className="mt-0.5 shrink-0 text-cold" /> {c.hours}</li>
      {c.email && <li><a href={`mailto:${c.email}`} className={CONTACT_LINK}><Mail size={18} className="mt-0.5 shrink-0 text-cold" /> {c.email}</a></li>}
    </>
  );
}
