import { MapPin } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import type { DayLogRowProps } from "@/types/myWork";
import { FileBadges } from "../../../FileBadges";
import { bakuTime } from "../../../time";

// İş yeri: mağaza/filial (şirkətin adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer
function placeOf(l: DayLogRowProps["l"]) {
  if (l.stores) return `${l.stores.companies?.name ?? ""} · ${l.stores.name}`;
  if (l.companies) return l.companies.name;
  return l.place_text ?? "—";
}

// Günün işi: usta(lar), yer, görülən iş, fayl nişanları, saat
export function DayLogRow({ l, onOpen }: DayLogRowProps) {
  return (
    <li>
      <button type="button" onClick={() => onOpen(l.id)}
        className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-bg max-sm:gap-2 max-sm:px-0">
      <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-10 !w-10 shrink-0 !text-xs max-sm:!h-8 max-sm:!w-8 max-sm:!text-[10px]" />
      <div className="@container min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-sm">
          {/* Mobildə ad (qrupda "A + B") həmişə bir sətir: şrift kartın eninə görə kiçilir (ən çox 14px) */}
          <span className="font-semibold max-sm:basis-full max-sm:whitespace-nowrap max-sm:text-[min(14px,calc(100cqi/var(--n)))]"
            style={{ "--n": ((l.employees?.full_name ?? "—").length * 0.58).toFixed(1) } as React.CSSProperties}>{l.employees?.full_name ?? "—"}</span>
          <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-primary"><MapPin size={12} className="shrink-0" /> <span className="truncate">{placeOf(l)}</span></span>
        </p>
        <p className="muted mt-0.5 text-sm">{l.description}</p>
        {/* Mobildə nişanlar mətnin altında (sağda yer yoxdur) */}
        <FileBadges files={l.files} className="mt-1 sm:hidden" />
      </div>
      <FileBadges files={l.files} className="max-sm:hidden" />
      <p className="shrink-0 text-sm font-semibold tabular-nums">{bakuTime(l.created_at)}</p>
      </button>
    </li>
  );
}
