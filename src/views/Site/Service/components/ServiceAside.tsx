import { Lightbulb, Phone } from "lucide-react";
import { ServiceIcon } from "@/components/landing/icons";
import { WhatsAppIcon } from "@/components/landing/WhatsAppIcon";
import type { ServiceAsideProps } from "@/types/site";
import { ContactTile } from "./ContactTile";

// Sağ: yapışan çağırış bloku və məsləhət.
// Çağırış kartı: tünd aurora fon + fırlanan işıqlı haşiyə; başlıq, iki şüşə "əlaqə plitəsi" (zəng, WhatsApp), altda yanıb-sönən nöqtə ilə iş saatları.
// Plitələr ≥ 1024 və mobildə alt-alta, planşetdə yan-yana (kart tam endədir); 640–767-də yan-yana plitədə nömrə 12px-ə düşürdü → orada da alt-alta.
// Bəyənilmədi: iri ayrıca nömrə + yumru düymələr ("kobud"); planşetdə məzmun solda (sağ yarı boş), iki sütun, hər şey mərkəzdə.
export function ServiceAside({ service, t, phone, hours, tel, wa }: ServiceAsideProps) {
  return (
    <aside className="grid gap-4 lg:sticky lg:top-20">
      <div className="glow-border aurora relative overflow-hidden rounded-[32px] bg-night p-7 text-white max-sm:p-5">
        <ServiceIcon name={service.icon} size={220} strokeWidth={1} className="pointer-events-none absolute -bottom-12 -right-12 text-cold/10" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cold/15 text-cold ring-1 ring-cold/30"><ServiceIcon name={service.icon} size={22} /></span>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold leading-tight">{t["service.aside_title"]}</h2>
              <p className="mt-1 text-sm text-white/65">{t["service.aside_text"]}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:max-lg:grid-cols-2">
            {tel && <ContactTile href={tel} label={t["contact.call_label"]} value={phone} icon={<Phone size={20} />} iconClass="bg-cold" />}
            {wa && <ContactTile href={wa} external label={t["contact.whatsapp"]} value={t["services.cta_button"]} icon={<WhatsAppIcon size={21} />} iconClass="bg-[#25D366]" />}
          </div>
          <p className="mt-5 flex items-center gap-2.5 border-t border-white/10 pt-4 text-sm text-white/60">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
            </span>
            {hours}
          </p>
        </div>
      </div>

      {service.note && (
        <div className="flex gap-4 rounded-[28px] bg-ice p-6 text-night">
          <Lightbulb size={24} className="mt-0.5 shrink-0 text-cold" />
          <p className="font-medium leading-relaxed">{service.note}</p>
        </div>
      )}
    </aside>
  );
}
