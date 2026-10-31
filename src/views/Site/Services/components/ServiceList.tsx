import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import { Spotlight } from "@/components/landing/Spotlight";
import { serviceIcon } from "@/components/landing/icons";
import { getServices } from "@/lib/site-content";
import { getTexts } from "@/lib/site-texts";

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
              <Link href={`/xidmet/${s.slug}`}
                className="group flex h-full flex-col rounded-[28px] bg-white p-3 ring-1 ring-night/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_rgba(6,25,43,0.14)]">
                <div className="relative">
                  {/* Bütün kartlarda eyni çərçivə (16:10): şəkillərin nisbəti fərqlidir, öz nisbətində göstərəndə kartlar qeyri-bərabər olurdu */}
                  <div className="aspect-[16/10] overflow-hidden rounded-[20px] bg-gradient-to-br from-ice to-glacier">
                    {s.image_url
                      // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
                      ? <img src={s.image_url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      : <div className="grid h-full place-items-center text-cold"><Icon size={56} strokeWidth={1.4} /></div>}
                  </div>
                  {/* Mobildə ikon kiçik (56 → 44px) */}
                  <span className="absolute -bottom-6 left-5 grid h-14 w-14 place-items-center rounded-2xl bg-cold text-white shadow-[0_12px_28px_rgba(0,163,217,0.4)] ring-4 ring-white transition-transform duration-300 group-hover:-rotate-6 max-sm:-bottom-5 max-sm:h-11 max-sm:w-11 max-sm:rounded-xl max-sm:ring-[3px] [&>svg]:max-sm:size-5">
                    <Icon size={24} />
                  </span>
                </div>
                <div className="@container flex flex-1 flex-col px-4 pb-4 pt-10 max-sm:pt-8">
                  {/* Şrift kartın eninə görə: ən uzun ad ("Təmir və diaqnostika") dar kartda da bir sətirdə qalsın */}
                  <h3 className="font-display text-[min(1.25rem,calc(100cqi/12.9))] font-bold leading-tight">{s.title}</h3>
                  {s.text && <p className="mt-2 text-night/60">{s.text}</p>}
                  {/* Mobildə "Ətraflı" kartın tam enində */}
                  <span className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-bold text-cold max-sm:w-full">
                    <span className="inline-flex items-center gap-2 rounded-full bg-glacier px-4 py-2 transition-colors group-hover:bg-cold group-hover:text-white max-sm:w-full max-sm:justify-center max-sm:py-3">
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
