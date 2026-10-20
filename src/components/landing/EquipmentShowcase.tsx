"use client";

import { useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { Equipment } from "@/lib/site-content";
import { EquipmentVisual } from "./EquipmentVisual";

type Item = Pick<Equipment, "id" | "key" | "title" | "text" | "place" | "image_url">;

// Mobil kartda şəklin üstündəki şüşə həb (sıra nömrəsi və yer)
// (< 360px enində kənar boşluq kiçilir ki, "Yaşayış kompleksi, villa" kimi uzun yer kəsilməsin)
const glassPill = "rounded-full bg-night/55 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur-md max-[359px]:px-2";

// Avadanlıq vitrini: solda növlərin siyahısı (tablar), sağda seçilmiş növün böyük səhnəsi.
// Bəndlər səhnənin hündürlüyünə paylanır (ilki üst, sonuncusu alt kənarla bir xətdə). Planşetdə də yan-yana
// (siyahı dar, miniatür kiçik). Mobildə tab yoxdur: hər növ öz səhnə kartıdır, alt-alta, nömrə nişanı ilə;
// sürüşdürdükcə kart yumşaq açılır (.eq-card, motion.css). Bəyənilmədi: yana sürüşən sıra, miniatür sırası.
// Bütün növlər DOM-dadır (axtarış sistemləri hamısını oxuyur); ≥ 640 yalnız seçilən görünür.
// Şəkil kəsilmir: çərçivə şəklin öz nisbətindədir.
export function EquipmentShowcase({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Ox düymələri ilə tablar arasında keçid (WAI-ARIA tabs nümunəsi)
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === "ArrowDown" ? i + 1 : e.key === "ArrowUp" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const n = (next + items.length) % items.length;
    setActive(n);
    tabs.current[n]?.focus();
  };

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(200px,250px)_1fr] lg:grid-cols-[minmax(300px,380px)_1fr] 2xl:grid-cols-[430px_1fr]">
      <div role="tablist" aria-orientation="vertical" aria-label="Avadanlıq növləri" className="flex flex-col justify-between gap-2 max-sm:hidden">
        {items.map((e, i) => {
          const on = i === active;
          return (
            <button
              key={e.id}
              ref={(el) => { tabs.current[i] = el; }}
              type="button"
              role="tab"
              id={`eq-tab-${e.id}`}
              aria-selected={on}
              aria-controls={`eq-panel-${e.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(ev) => onKey(ev, i)}
              className={`group relative flex items-center gap-4 overflow-hidden rounded-[22px] p-3 pr-5 text-left transition-all duration-300 sm:max-lg:gap-3 sm:max-lg:p-2.5 sm:max-lg:pr-3 lg:flex-1 lg:items-stretch lg:rounded-[26px] lg:p-2.5 lg:pr-6 ${
                on ? "bg-white shadow-[0_18px_40px_rgba(6,25,43,0.1)] ring-1 ring-night/5" : "hover:bg-white/60"
              }`}
            >
              {/* Seçiləndə solda göy zolaq böyüyür */}
              <span className={`absolute inset-y-3 left-0 w-1 rounded-r-full bg-cold transition-transform duration-300 ${on ? "scale-y-100" : "scale-y-0"}`} aria-hidden="true" />
              {/* ≥ 1024: şəkil kartın bütün hündürlüyünü tutur (bəndlər səhnənin hündürlüyünü bərabər bölür, aralarda boşluq qalmır) */}
              <span className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-2xl transition-opacity sm:max-lg:h-11 sm:max-lg:w-14 lg:h-auto lg:w-28 lg:rounded-[20px] 2xl:w-36 ${on ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                <EquipmentVisual item={e} artClassName="w-full max-w-[64px]" className={`!p-2 ${e.image_url ? "lg:hidden" : ""}`} />
                {e.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element -- storage şəkli; miniatürdə doldurur (səhnədə şəkil kəsilmir)
                  <img src={e.image_url} alt="" className={`absolute inset-0 hidden h-full w-full object-cover transition duration-700 lg:block ${on ? "scale-110" : "grayscale-[40%] group-hover:grayscale-0"}`} />
                )}
                {/* ≥ 1024: şəklin küncündə sıra nömrəsi (mobil kartlardakı kimi şüşə həb); seçiləndə göy */}
                <span className={`absolute left-2 top-2 hidden rounded-full px-2 py-0.5 font-display text-[11px] font-bold tabular-nums ring-1 backdrop-blur-md transition-colors lg:block ${on ? "bg-cold text-white ring-cold" : "bg-night/50 text-white/85 ring-white/20"}`} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="min-w-0 lg:flex lg:flex-1 lg:flex-col lg:justify-center">
                <span className={`block font-display text-base font-bold transition-colors sm:max-lg:text-[13px] 2xl:text-lg ${on ? "text-night" : "text-night/60 group-hover:text-night"}`}>{e.title}</span>
                {e.place && <span className="mt-0.5 block truncate text-sm text-night/45 sm:max-lg:text-xs">{e.place}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="max-sm:space-y-5">
        {items.map((e, i) => {
          const on = i === active;
          return (
            // `hidden` atributu yox: mobildə hamısı görünür, ≥ 640 seçilməyənlər sm:hidden ilə gizlənir
            <article
              key={e.id}
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
                  <span className={`${glassPill} shrink-0 font-display tracking-wide`}>
                    {String(i + 1).padStart(2, "0")} <span className="text-white/50">/ {String(items.length).padStart(2, "0")}</span>
                  </span>
                  {e.place && (
                    <span className={`${glassPill} inline-flex min-w-0 items-center gap-1.5`}>
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
        })}
      </div>
    </div>
  );
}
