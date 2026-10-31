import { CircleCheck } from "lucide-react";
import { ServiceIcon } from "@/components/landing/icons";
import { Reveal } from "@/components/landing/Reveal";
import type { ServiceBlockProps } from "@/types/site";

// Sol: şəkil, ətraflı mətn, "Nə daxildir" və addımlar
export function ServiceBody({ service, t }: ServiceBlockProps) {
  const paragraphs = service.details.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="grid gap-4">
      {service.image_url && (
        <Reveal className="reveal-wipe"><div className="overflow-hidden rounded-[32px] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element -- storage şəkli */}
          <img src={service.image_url} alt={service.title} className="block h-auto w-full" />
        </div></Reveal>
      )}

      {(paragraphs.length > 0 || service.text) && (
        <div className="flex gap-6 rounded-[28px] bg-white p-7 sm:p-9">
          <span className="hidden h-16 w-16 shrink-0 place-items-center rounded-2xl bg-glacier text-cold sm:grid"><ServiceIcon name={service.icon} size={30} /></span>
          <div className="space-y-4 text-lg leading-relaxed text-night/75">
            {(paragraphs.length > 0 ? paragraphs : [service.text]).map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>
      )}

      {service.includes.length > 0 && (
        <div className="rounded-[28px] bg-white p-7 sm:p-9">
          <h2 className="font-display text-2xl font-bold">{t["service.includes"]}</h2>
          {/* Bənd sayı tək olanda son bənd iki sütunu tutur (sağda boş xana qalmasın) */}
          <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
            {service.includes.map((item) => (
              <li key={item} className="flex items-start gap-3 border-b border-night/5 pb-4 font-medium">
                <CircleCheck size={20} className="mt-0.5 shrink-0 text-cold" /> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Addımlar ardıcıllıqdır: nömrələnir, aralarında xətt; tünd aurora fonda */}
      {service.steps.length > 0 && (
        <div className="aurora relative overflow-hidden rounded-[28px] bg-night p-7 text-white sm:p-9">
          <h2 className="font-display text-2xl font-bold">{t["service.steps"]}</h2>
          <ol className="relative mt-8 grid gap-6 sm:grid-cols-2 xl:grid-flow-col xl:auto-cols-fr xl:grid-cols-none">
            <span className="absolute left-5 right-5 top-5 hidden h-0.5 bg-gradient-to-r from-cold via-ice/40 to-cold xl:block" aria-hidden="true" />
            {service.steps.map((step, i) => (
              // Mobildə nömrə mətnin solunda (üstündə çox yer tuturdu)
              <li key={step} className="relative max-sm:flex max-sm:items-center max-sm:gap-4">
                <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cold font-display text-sm font-bold">{i + 1}</span>
                <p className="mt-4 font-semibold text-white/90 max-sm:mt-0">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
