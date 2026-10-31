import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, User } from "lucide-react";
import { KIND } from "@/lib/kinds";
import type { ClientCardProps } from "@/types/clients";
import { ClientStat } from "./ClientStat";

export function ClientCard({ client: c, kind }: ClientCardProps) {
  const k = KIND[kind];
  const fixedPlace = kind === "company" && c.units === 0;

  return (
    <Link href={`${k.route}/${c.id}`} className="card card-link group flex min-w-0 grow basis-[380px] flex-col gap-4 !p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-frost to-primary text-xl font-extrabold text-white shadow-[0_6px_16px_rgba(31,111,235,0.3)]">
          {c.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-bold leading-snug">{c.name}</h3>
          <p className="muted text-xs font-medium">{fixedPlace ? "Sabit məkan" : `${c.units} ${k.unit}`}</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-bg text-muted transition-colors group-hover:bg-primary group-hover:text-white">
          <ArrowUpRight size={18} />
        </span>
      </div>

      {fixedPlace ? (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="min-w-0 rounded-xl bg-bg px-3 py-2">
            <p className="muted flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide"><MapPin size={12} /> Ünvan</p>
            <p className="line-clamp-2 text-sm font-semibold">{c.address ?? "Yazılmayıb"}</p>
          </div>
          <ClientStat label="Bu ay iş" value={c.works} tone={c.works ? "text-primary" : ""} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <ClientStat label={k.Unit} value={c.units} />
          <ClientStat label="Bu ay iş" value={c.works} tone={c.works ? "text-primary" : ""} />
        </div>
      )}

      <p className="muted mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dashed border-line pt-3 text-[13px]">
        <span className="flex min-w-0 items-center gap-1.5"><User size={13} className="shrink-0" /><span className="truncate">{c.contact_person ?? "Əlaqəli şəxs yoxdur"}</span></span>
        <span className="flex items-center gap-1.5"><Phone size={13} />{c.phone ?? "Telefon yoxdur"}</span>
      </p>
    </Link>
  );
}
