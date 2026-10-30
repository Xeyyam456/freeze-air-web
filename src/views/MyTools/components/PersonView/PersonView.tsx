import { useState } from "react";
import { Package, Wrench, X } from "lucide-react";
import { SOFT } from "@/views/Depot/constants/tones";
import { dateAz, daysSince } from "@/views/Depot/utils/dates";
import { fmt, showQty } from "@/views/Depot/utils/quantity";
import type { Kind } from "@/types/depot";
import { Avatar } from "@/components/employees/EmployeeList";
import { Modal } from "@/shared/components/Modal";
import { counts } from "../../utils/people";
import type { PersonViewProps } from "@/types/myTools";

export function PersonView({ p, me, onClose }: PersonViewProps) {
  const [kind, setKind] = useState<Kind>(counts(p).tools || !counts(p).mats ? "tool" : "material");
  const c = counts(p);
  const list = p.items.filter((h) => (h.tools?.kind === "material" ? "material" : "tool") === kind);
  return (
    <Modal onClose={onClose} labelledBy="who-title" className="!max-w-xl">
      <div className="-mx-6 -mt-6 max-sm:-mx-4 max-sm:-mt-5 mb-5 overflow-hidden rounded-t-[18px] bg-[linear-gradient(135deg,#7c3aed,#4f46e5_60%,#2563eb)] px-6 max-sm:px-4 pb-5 pt-5 max-sm:pb-3 max-sm:pt-3 text-white">
        <div className="flex items-start gap-4 max-sm:gap-2.5">
          <Avatar employee={{ full_name: p.name, photo_url: p.photo }} className="!h-14 !w-14 !text-base ring-4 ring-white/25 max-sm:!h-10 max-sm:!w-10 max-sm:!text-sm max-sm:ring-2" />
          <div className="min-w-0 flex-1 pt-1 max-sm:pt-0">
            <h2 id="who-title" className="truncate text-xl font-bold leading-tight max-sm:whitespace-normal max-sm:break-words max-sm:text-[15px] max-sm:[text-overflow:clip]">{p.name}{p.id === me ? " (sən)" : ""}</h2>
            <p className="text-[13px] text-white/70 max-sm:text-xs">Üzərindəkilər</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 max-sm:h-7 max-sm:w-7 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="Bağla"><X size={18} /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 max-sm:mt-2.5 max-sm:gap-1.5">
          {([["Alət", `${c.tools} ədəd`], ["Material", `${c.mats} növ`]] as const).map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-white/12 px-3.5 py-2.5 max-sm:rounded-xl max-sm:px-2 max-sm:py-1.5">
              <p className="text-[11px] max-sm:text-[10px] font-semibold text-white/65">{l}</p>
              <p className="text-lg max-sm:text-sm font-extrabold tabular-nums max-sm:whitespace-nowrap">{v}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-1 rounded-xl bg-line/60 p-1" role="tablist" aria-label="Növ">
        {([["tool", "Alətlər", c.tools, Wrench], ["material", "Materiallar", c.mats, Package]] as const).map(([k, l, n, Icon]) => (
          <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
            className={`inline-flex h-9 max-sm:h-8 flex-1 items-center justify-center gap-2 max-sm:gap-1.5 rounded-lg text-[13px] max-sm:text-xs font-semibold transition-colors ${kind === k ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            <Icon size={14} /> {l} <span className="rounded-full bg-bg px-1.5 text-[11px] font-bold text-muted">{n}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="muted mt-4 rounded-2xl border border-dashed border-line py-8 text-center text-sm">{kind === "tool" ? "Alət yoxdur" : "Material yoxdur"}</p>
      ) : (
        <ul className="mt-4 max-h-[min(360px,calc(100dvh-400px))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden divide-y divide-line overflow-y-auto rounded-2xl border border-line px-3">
          {list.map((h) => {
            const t = h.tools;
            const mat = t?.kind === "material";
            const d = daysSince(h.taken_at);
            return (
              <li key={h.id} className="flex items-center gap-3 py-2.5 max-sm:gap-2 max-sm:py-2">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl max-sm:hidden ${mat ? SOFT.teal : SOFT.blue}`}>{mat ? <Package size={16} /> : <Wrench size={16} />}</span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm max-sm:text-[13px] font-semibold">{t?.name ?? "—"}</b>
                  <span className="muted block text-xs max-sm:text-[11px]"><span className="max-sm:hidden">götürüb </span>{dateAz(h.taken_at)} · {d === 0 ? "bu gün" : `${d} gün`}</span>
                </span>
                <span className="shrink-0 text-sm max-sm:text-xs font-bold tabular-nums text-primary">{t ? showQty(h.quantity, mat ? t.unit : "ədəd", t) : fmt(h.quantity)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
