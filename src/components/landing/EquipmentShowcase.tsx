"use client";

import { useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { Equipment } from "@/lib/site-content";
import { EquipmentVisual } from "./EquipmentVisual";

type Item = Pick<Equipment, "id" | "key" | "title" | "text" | "place" | "image_url">;

// Avadanlıq vitrini: solda növlərin siyahısı (tablar), sağda seçilmiş növün böyük səhnəsi.
// Bütün növlər DOM-dadır (axtarış sistemləri hamısını oxuyur), yalnız seçilən görünür.
// Şəkil kəsilmir (object-contain); arxasında eyni şəklin bulanıq, böyüdülmüş variantı fonu doldurur.
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
    <div className="grid gap-6 lg:grid-cols-[minmax(300px,380px)_1fr]">
      <div role="tablist" aria-orientation="vertical" aria-label="Avadanlıq növləri" className="flex flex-col gap-2">
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
              className={`group relative flex items-center gap-4 overflow-hidden rounded-[22px] p-3 pr-5 text-left transition-all duration-300 ${
                on ? "bg-white shadow-[0_18px_40px_rgba(6,25,43,0.1)] ring-1 ring-night/5" : "hover:bg-white/60"
              }`}
            >
              {/* Seçiləndə solda göy zolaq böyüyür */}
              <span className={`absolute inset-y-3 left-0 w-1 rounded-r-full bg-cold transition-transform duration-300 ${on ? "scale-y-100" : "scale-y-0"}`} aria-hidden="true" />
              <span className={`h-14 w-20 shrink-0 overflow-hidden rounded-2xl transition-opacity ${on ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                <EquipmentVisual item={e} artClassName="w-full max-w-[64px]" className="!p-2" />
              </span>
              <span className="min-w-0">
                <span className={`block font-display text-base font-bold transition-colors ${on ? "text-night" : "text-night/60 group-hover:text-night"}`}>{e.title}</span>
                {e.place && <span className="mt-0.5 block truncate text-sm text-night/45">{e.place}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div>
        {items.map((e, i) => {
          const on = i === active;
          return (
            <article
              key={e.id}
              id={`eq-panel-${e.id}`}
              role="tabpanel"
              aria-labelledby={`eq-tab-${e.id}`}
              hidden={!on}
              className="eq-stage aurora relative overflow-hidden rounded-[32px] bg-night p-3 text-white"
            >
              {/* Şəkil səhnəsi: çərçivə şəklin öz nisbətindədir (h-auto), şəkil kəsilmir və künclərdə boşluq qalmır */}
              <div className="eq-image overflow-hidden rounded-[24px]">
                {e.image_url
                  // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
                  ? <img src={e.image_url} alt={e.title} className="block h-auto w-full" />
                  : <div className="aspect-video"><EquipmentVisual item={e} artClassName="w-full max-w-[320px]" /></div>}
              </div>
              {/* Məlumat: şəklin altında tünd zolaqda (açıq şəkil üstündə ağ yazı oxunmurdu) */}
              <div className="eq-info flex flex-wrap items-end justify-between gap-x-10 gap-y-4 px-5 pb-4 pt-6">
                <div className="max-w-2xl">
                  <h2 className="font-display text-2xl font-bold sm:text-3xl">{e.title}</h2>
                  {e.text && <p className="mt-2 text-white/70">{e.text}</p>}
                </div>
                {e.place && (
                  <p className="inline-flex shrink-0 items-center gap-2 rounded-full bg-cold/15 px-4 py-2 text-sm font-semibold text-[#7fdcff] ring-1 ring-cold/30">
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
