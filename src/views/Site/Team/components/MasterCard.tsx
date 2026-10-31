import { Briefcase } from "lucide-react";
import { Spotlight } from "@/components/landing/Spotlight";
import { initials } from "@/lib/experience";
import type { MasterCardProps } from "@/types/site";
import { typeKey } from "../constants/workerTypes";

// Usta kartı (üfüqi, yığcam): solda şəkil, sağda ixtisas, ad və təcrübə; təcrübə zolağı ən təcrübəli ustaya nisbətlə dolur.
export function MasterCard({ e, max, t }: MasterCardProps) {
  const share = max > 0 ? Math.max(6, Math.round((e.months / max) * 100)) : 0;
  return (
    <Spotlight className="h-full rounded-[28px]">
      {/* Şəkil kartın eninə görə: 128px, planşetin iki sütununda 96px, mobildə 80px */}
      <article className="group flex h-full items-center gap-6 rounded-[28px] bg-white p-4 pr-7 ring-1 ring-night/5 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(6,25,43,0.12)] max-sm:gap-4 max-sm:pr-5 md:max-lg:gap-5">
        <span className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[22px] bg-gradient-to-br from-ice to-glacier max-sm:h-20 max-sm:w-20 max-sm:rounded-[18px] md:max-lg:h-24 md:max-lg:w-24">
          {e.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
            <img src={e.photo_url} alt={e.full_name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <span className="grid h-full w-full place-items-center bg-gradient-to-br from-cold to-night font-display text-3xl font-bold text-white">
              {initials(e.full_name)}
            </span>
          )}
        </span>
        <div className="@container min-w-0 flex-1">
          {/* İxtisas solda, iş növü sağda sakit haşiyəli həb (şəklin üstündəki nişan bəyənilmədi: tünd və şüşə variantları).
              İxtisas bir sətirdə, kəsilmədən (2 sətrə düşəndə ad xətti pozulurdu): şrift kartın eninə görə, 84px = həb + ara; < 400px həb gizli (ixtisas 9px-ə düşürdü) */}
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-[min(0.875rem,calc((100cqi-84px)/9.2))] font-bold text-cold max-[400px]:text-[min(0.875rem,calc(100cqi/9.2))]">{e.specialty ?? t["team.specialty"]}</p>
            <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold text-night/55 ring-1 ring-night/10 max-[400px]:hidden">
              {t[typeKey(e.worker_type)]}
            </span>
          </div>
          {/* Ad bir sətirdə, kəsilmədən: şrift kartın eninə görə */}
          <h2 className="mt-1 truncate font-display text-[min(1.25rem,calc(100cqi/11.2))] font-bold leading-tight">{e.full_name}</h2>
          <div className="mt-4 flex items-center gap-2 text-sm text-night/60">
            <Briefcase size={15} className="shrink-0 text-cold" />
            {e.experience ? <span>{t["team.experience"]} <b className="font-semibold text-night">{e.experience}</b></span> : <span>{t["team.new"]}</span>}
          </div>
          {/* Təcrübə zolağı: görünəndə dolur (.stat-bar animasiyası) */}
          <span className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-glacier" aria-hidden="true">
            <span className="stat-bar" style={{ width: `${share}%`, height: "100%" }} />
          </span>
        </div>
      </article>
    </Spotlight>
  );
}
