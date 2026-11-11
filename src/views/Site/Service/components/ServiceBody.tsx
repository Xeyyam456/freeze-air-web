import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { ServiceIcon } from "@/components/landing/icons";
import { Reveal } from "@/components/landing/Reveal";
import { tone } from "@/components/landing/tones";
import type { ServiceBlockProps } from "@/types/site";

// Sol: şəkil, ətraflı mətn, "Nə daxildir" və addımlar
export function ServiceBody({ service, t }: ServiceBlockProps) {
  const paragraphs = service.details.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="grid gap-4">
      {service.image_url && (
        <Reveal className="reveal-wipe"><div className="overflow-hidden rounded-[32px] bg-white">
          <Image width={1600} height={1000} sizes="(min-width: 1024px) 60vw, 100vw" src={service.image_url} alt={service.title} className="block h-auto w-full" />
        </div></Reveal>
      )}

      {(paragraphs.length > 0 || service.text) && (
        <div className="flex gap-6 rounded-[28px] bg-white bg-[radial-gradient(60%_80%_at_0%_0%,rgba(0,163,217,0.1),transparent)] p-7 sm:p-9">
          <span className="hidden h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#00a3d9,#0b6aa3)] text-white shadow-[0_12px_28px_rgba(0,163,217,0.4)] sm:grid"><ServiceIcon name={service.icon} size={30} /></span>
          <div className="space-y-4 text-lg leading-relaxed text-night/75">
            {(paragraphs.length > 0 ? paragraphs : [service.text]).map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>
      )}

      {service.includes.length > 0 && (
        <div className="relative overflow-hidden rounded-[28px] bg-white p-7 sm:p-9">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cold via-primary via-55% to-heat" aria-hidden="true" />
          <h2 className="font-display text-2xl font-bold">{t["service.includes"]}</h2>
          {/* Bənd sayı tək olanda son bənd iki sütunu tutur (sağda boş xana qalmasın) */}
          <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
            {service.includes.map((item, i) => (
              <li key={item} style={tone(i)} className="flex items-start gap-3 border-b border-night/5 pb-4 font-medium">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--tone)_14%,white)] text-(--tone)"><CircleCheck size={16} /></span> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Addımlar ardıcıllıqdır: nömrələnir, aralarında xətt; tünd aurora fonda */}
      {service.steps.length > 0 && (
        <div className="aurora relative overflow-hidden rounded-[28px] bg-night p-7 text-white sm:p-9">
          <h2 className="font-display text-2xl font-bold">{t["service.steps"]}</h2>
          {/* ≥ 1280: sonuncu sütun məzmuna görə (auto), qalanları bərabər: sonuncu addım sağ kənara çatır, ondan sonra boşluq qalmır.
              Xətt hər addımın özündədir (düyündən növbəti düyünə), sonuncuda yoxdur */}
          <ol style={{ "--cols": service.steps.length > 1 ? `repeat(${service.steps.length - 1}, minmax(0, 1fr)) auto` : "auto" } as React.CSSProperties} className="relative mt-8 grid gap-6 sm:grid-cols-2 xl:[grid-template-columns:var(--cols)]">
            {service.steps.map((step, i) => (
              // Mobildə nömrə mətnin solunda (üstündə çox yer tuturdu)
              <li key={step} style={tone(i)} className="relative max-sm:flex max-sm:items-center max-sm:gap-4 xl:not-last:after:absolute xl:not-last:after:left-10 xl:not-last:after:top-5 xl:not-last:after:h-0.5 xl:not-last:after:w-[calc(100%-1rem)] xl:not-last:after:bg-[linear-gradient(90deg,var(--tone),color-mix(in_srgb,var(--tone)_25%,transparent))] xl:not-last:after:content-['']">
                <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-(--tone) font-display text-sm font-bold shadow-[0_8px_20px_color-mix(in_srgb,var(--tone)_50%,transparent)] ring-4 ring-night">{i + 1}</span>
                <p className="mt-4 font-semibold text-white/90 max-sm:mt-0">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
