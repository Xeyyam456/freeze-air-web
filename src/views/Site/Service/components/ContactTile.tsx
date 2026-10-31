import { ArrowUpRight } from "lucide-react";
import type { ContactTileProps } from "@/types/site";

// Çağırış kartındakı şüşə plitə: rəngli ikon, kiçik etiket, dəyər (bir sətirdə, şrift plitənin eninə görə), hover-də fırlanan ox
export function ContactTile({ href, external, label, value, icon, iconClass }: ContactTileProps) {
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group/tile flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:ring-cold/50 max-sm:gap-3">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-lg ${iconClass}`}>{icon}</span>
      <span className="@container min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wider text-white/50">{label}</span>
        {/* 11.6 ≈ nömrənin eni / şrift ölçüsü (+ ehtiyat) */}
        <span className="mt-0.5 block whitespace-nowrap font-display text-[min(1.125rem,calc(100cqi/11.6))] font-bold">{value}</span>
      </span>
      {/* Mobildə ox gizli: dar plitədə nömrəyə yer qalsın */}
      <ArrowUpRight size={18} className="shrink-0 text-white/40 transition-all duration-300 group-hover/tile:rotate-45 group-hover/tile:text-white max-sm:hidden" />
    </a>
  );
}
