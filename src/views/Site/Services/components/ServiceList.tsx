import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import { Spotlight } from "@/components/landing/Spotlight";
import { tone } from "@/components/landing/tones";
import { serviceIcon } from "@/components/landing/icons";
import { getServices } from "@/services/site/fetchSiteContent.server";
import { getTexts } from "@/services/site/fetchSiteTexts.server";

// "Bütün xidmətlər": üç sütunlu kart şəbəkəsi. Kartda xidmətin şəkli (eyni 16:10 çərçivədə, simmetriya üçün), şəklin küncünə
// oturan ikon, ad, izah və "Ətraflı" həbi. Hover: kart qalxır, şəkil azca yaxınlaşır, kursor işığı (Spotlight).
// Əvvəlki variantlar bəyənilmədi: hover-də çıxan şəkil və iri sətirli siyahı.
export async function ServiceList() {
  const [services, t] = await Promise.all([getServices(), getTexts()]);
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => {
        const Icon = serviceIcon(s.icon);
        return (
          <Reveal key={s.id} delay={(i % 3) * 90} className="h-full">
            <Spotlight className="h-full rounded-[28px]">
              <Link href={`/xidmet/${s.slug}`} style={tone(i)}
                className="group flex h-full flex-col rounded-[28px] bg-white bg-[radial-gradient(90%_40%_at_50%_100%,color-mix(in_srgb,var(--tone)_11%,transparent),transparent)] p-3 ring-1 ring-night/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_color-mix(in_srgb,var(--tone)_26%,transparent)] hover:ring-[color-mix(in_srgb,var(--tone)_40%,transparent)]">
                <div className="relative">
                  {/* Bütün kartlarda eyni çərçivə (16:10): şəkillərin nisbəti fərqlidir, öz nisbətində göstərəndə kartlar qeyri-bərabər olurdu */}
                  <div className="aspect-[16/10] overflow-hidden rounded-[20px] bg-gradient-to-br from-ice to-glacier">
                    {s.image_url
                      ? <Image width={1600} height={1000} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" src={s.image_url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      : <div className="grid h-full place-items-center text-(--tone)"><Icon size={56} strokeWidth={1.4} /></div>}
                  </div>
                  {/* Mobildə ikon kiçik (56 → 44px) */}
                  <span className="absolute -bottom-6 left-5 grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--tone),color-mix(in_srgb,var(--tone)_55%,#06192b))] text-white shadow-[0_12px_28px_color-mix(in_srgb,var(--tone)_45%,transparent)] ring-4 ring-white transition-transform duration-300 group-hover:-rotate-6 max-sm:-bottom-5 max-sm:h-11 max-sm:w-11 max-sm:rounded-xl max-sm:ring-[3px] [&>svg]:max-sm:size-5">
                    <Icon size={24} />
                  </span>
                </div>
                <div className="@container flex flex-1 flex-col px-4 pb-4 pt-10 max-sm:pt-8">
                  {/* Şrift kartın eninə görə: ən uzun ad ("Təmir və diaqnostika") dar kartda da bir sətirdə qalsın */}
                  <h3 className="font-display text-[min(1.25rem,calc(100cqi/12.9))] font-bold leading-tight">{s.title}</h3>
                  {s.text && <p className="mt-2 text-night/60">{s.text}</p>}
                  {/* Mobildə "Ətraflı" kartın tam enində */}
                  <span className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-bold text-(--tone) max-sm:w-full">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--tone)_12%,white)] px-4 py-2 transition-colors group-hover:bg-(--tone) group-hover:text-white max-sm:w-full max-sm:justify-center max-sm:py-3">
                      {t["service.more"]} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </div>
              </Link>
            </Spotlight>
          </Reveal>
        );
      })}
    </div>
  );
}
