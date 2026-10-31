import { Briefcase, Phone } from "lucide-react";
import { experience } from "@/lib/experience";
import { Avatar } from "@/shared/components/Avatar";
import type { PersonCardProps } from "@/types/employees";
import { STATUS_TONE } from "./constants";

// Profil kartı (Ustalar, Rəhbərlik): tünd zolaq, üstünə çıxan şəkil, ad, vəzifə, vəziyyət, rəqəmlər, zəng; klik → məlumat pəncərəsi
export function PersonCard({ person, subtitle, badge, highlight = false, status, stats, onOpen }: PersonCardProps) {
  const exp = experience(person.start_date);
  const tone = status ? STATUS_TONE[status.kind] : null;

  return (
    <div
      className={`card card-link flex min-w-0 cursor-pointer flex-col overflow-hidden !p-0 ${highlight ? "!border-primary ring-2 ring-primary-soft" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`${person.full_name}: məlumatlara bax`}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && onOpen()}
    >
      <div className="relative h-16 shrink-0 bg-[#0c1b36] bg-[radial-gradient(220px_90px_at_100%_0%,rgba(34,195,230,0.3),transparent_70%)]">
        {badge && <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">{badge}</span>}
      </div>

      <div className="-mt-10 flex flex-1 flex-col items-center px-5 pb-5 text-center">
        <span className="relative">
          <Avatar employee={person} className="!h-[76px] !w-[76px] !text-xl ring-4 ring-white" />
          {tone?.dot && <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full ring-[3px] ring-white ${tone.dot}`} title={status!.text} />}
        </span>
        <h3 className="mt-2 max-w-full truncate text-base font-bold">{person.full_name}</h3>
        <p className="muted max-w-full truncate text-[13px]">{subtitle}</p>
        {status && tone && <span className={`mt-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone.pill}`}>{status.text}</span>}

        {stats && (
          <div className="mt-4 grid w-full grid-cols-2 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-bg px-3 py-2">
                <p className="muted text-[11px] font-semibold uppercase tracking-wide">{s.label}</p>
                <p className={`text-lg font-extrabold tabular-nums leading-tight ${s.tone ?? ""}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="min-h-4 flex-1" />
        <div className="flex w-full items-center justify-between gap-2 border-t border-dashed border-line pt-3 text-xs font-semibold">
          <span className="flex min-w-0 items-center gap-1.5" title="Təcrübə">
            <Briefcase size={14} className="shrink-0 text-primary" />
            <span className={`truncate ${exp ? "" : "muted"}`}>{exp ?? "Təcrübə yazılmayıb"}</span>
          </span>
          {person.phone ? (
            <a href={`tel:${person.phone}`} onClick={(e) => e.stopPropagation()} className="btn btn-soft btn-sm shrink-0" title={person.phone}>
              <Phone size={14} /> Zəng et
            </a>
          ) : (
            <span className="muted flex shrink-0 items-center gap-1.5"><Phone size={13} /> Telefon yoxdur</span>
          )}
        </div>
      </div>
    </div>
  );
}
