import Image from "next/image";
import { EquipmentVisual } from "@/components/landing/EquipmentVisual";
import type { EquipmentTabButtonProps } from "@/types/site";
import { tone } from "@/components/landing/tones";

// Siyahıdakı bir növ (tab): miniatür, ad, yer
export function EquipmentTabButton({ item: e, index: i, on, tabRef, onSelect, onKey }: EquipmentTabButtonProps) {
  return (
    <button
      ref={tabRef}
      style={tone(i)}
      type="button"
      role="tab"
      id={`eq-tab-${e.id}`}
      aria-selected={on}
      aria-controls={`eq-panel-${e.id}`}
      tabIndex={on ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKey}
      className={`group relative flex items-center gap-4 overflow-hidden rounded-[22px] p-3 pr-5 text-left transition-all duration-300 sm:max-lg:gap-3 sm:max-lg:p-2.5 sm:max-lg:pr-3 lg:flex-1 lg:items-stretch lg:rounded-[26px] lg:p-2.5 lg:pr-6 ${
        on ? "bg-white bg-[linear-gradient(100deg,color-mix(in_srgb,var(--tone)_10%,white),white_60%)] shadow-[0_18px_40px_color-mix(in_srgb,var(--tone)_20%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--tone)_40%,transparent)]" : "hover:bg-white/60"
      }`}
    >
      {/* ≥ 1024: şəkil kartın bütün hündürlüyünü tutur (bəndlər səhnənin hündürlüyünü bərabər bölür, aralarda boşluq qalmır) */}
      <span className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-2xl transition-opacity sm:max-lg:h-11 sm:max-lg:w-14 lg:h-auto lg:w-28 lg:rounded-[20px] 2xl:w-36 ${on ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
        <EquipmentVisual item={e} artClassName="w-full max-w-[64px]" className={`!p-2 ${e.image_url ? "lg:hidden" : ""}`} />
        {e.image_url && (
          <Image width={1600} height={1000} sizes="240px" src={e.image_url} alt="" className={`absolute inset-0 hidden h-full w-full object-cover transition duration-700 lg:block ${on ? "scale-110" : "grayscale-[40%] group-hover:grayscale-0"}`} />
        )}
        {/* ≥ 1024: şəklin küncündə sıra nömrəsi (mobil kartlardakı kimi şüşə həb); seçiləndə göy */}
        <span className={`absolute left-2 top-2 hidden rounded-full px-2 py-0.5 font-display text-[11px] font-bold tabular-nums ring-1 backdrop-blur-md transition-colors lg:block ${on ? "bg-(--tone) text-white ring-(--tone)" : "bg-night/50 text-white/85 ring-white/20"}`} aria-hidden="true">
          {String(i + 1).padStart(2, "0")}
        </span>
      </span>
      <span className="min-w-0 lg:flex lg:flex-1 lg:flex-col lg:justify-center">
        <span className={`block font-display text-base font-bold transition-colors sm:max-lg:text-[13px] 2xl:text-lg ${on ? "text-night" : "text-night/60 group-hover:text-night"}`}>{e.title}</span>
        {e.place && <span className="mt-0.5 block truncate text-sm text-night/45 sm:max-lg:text-xs">{e.place}</span>}
      </span>
    </button>
  );
}
