import { MapPin } from "lucide-react";
import { EquipmentVisual } from "@/components/landing/EquipmentVisual";
import type { EquipmentStageProps } from "@/types/site";

// Mobil kartda şəklin üstündəki şüşə həb (sıra nömrəsi və yer)
// (< 360px enində kənar boşluq kiçilir ki, "Yaşayış kompleksi, villa" kimi uzun yer kəsilməsin)
const GLASS_PILL = "rounded-full bg-night/55 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur-md max-[359px]:px-2";

// Seçilmiş növün böyük səhnəsi. `hidden` atributu yox: mobildə hamısı görünür, ≥ 640 seçilməyənlər sm:hidden ilə gizlənir
export function EquipmentStage({ item: e, index: i, total, on }: EquipmentStageProps) {
  return (
    <article
      id={`eq-panel-${e.id}`}
      role="tabpanel"
      aria-labelledby={`eq-tab-${e.id}`}
      className={`eq-stage eq-card aurora relative overflow-hidden rounded-[32px] bg-night p-3 text-white ${on ? "" : "sm:hidden"}`}
    >
      {/* Şəkil səhnəsi: çərçivə şəklin öz nisbətindədir (h-auto), şəkil kəsilmir və künclərdə boşluq qalmır */}
      <div className="eq-image relative overflow-hidden rounded-[24px]">
        {e.image_url
          // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
          ? <img src={e.image_url} alt={e.title} className="block h-auto w-full" />
          : <div className="aspect-video"><EquipmentVisual item={e} artClassName="w-full max-w-[320px]" /></div>}
        {/* Mobildə şəklin üstündə iki şüşə həb qarşı-qarşıya: solda sıra "01 / 05", sağda yer */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2 sm:hidden max-[359px]:inset-x-2 max-[359px]:gap-1">
          <span className={`${GLASS_PILL} shrink-0 font-display tracking-wide`}>
            {String(i + 1).padStart(2, "0")} <span className="text-white/50">/ {String(total).padStart(2, "0")}</span>
          </span>
          {e.place && (
            <span className={`${GLASS_PILL} inline-flex min-w-0 items-center gap-1.5`}>
              <MapPin size={13} className="shrink-0 text-[#7fdcff]" /> <span className="truncate">{e.place}</span>
            </span>
          )}
        </div>
      </div>
      {/* Məlumat: şəklin altında tünd zolaqda (açıq şəkil üstündə ağ yazı oxunmurdu) */}
      <div className="eq-info flex flex-wrap items-end justify-between gap-x-10 gap-y-4 px-5 pb-4 pt-6 max-sm:px-3 max-sm:pt-5">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{e.title}</h2>
          {e.text && <p className="mt-2 text-white/70">{e.text}</p>}
        </div>
        {e.place && (
          <p className="inline-flex shrink-0 items-center gap-2 rounded-full bg-cold/15 px-4 py-2 text-sm font-semibold text-[#7fdcff] ring-1 ring-cold/30 max-sm:hidden">
            <MapPin size={15} /> {e.place}
          </p>
        )}
      </div>
    </article>
  );
}
