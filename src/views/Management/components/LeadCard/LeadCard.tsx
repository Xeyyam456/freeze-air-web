import { useState } from "react";
import { Briefcase, Crown, Phone } from "lucide-react";
import { experience } from "@/lib/experience";
import { Avatar } from "@/shared/components/Avatar";
import type { ManagerProps } from "@/types/management";
import { ManagerDetailsModal } from "../ManagerDetailsModal";

// Müdirin iri tünd kartı (rəhbərliyin başı)
export function LeadCard({ manager }: ManagerProps) {
  const [viewing, setViewing] = useState(false);
  const exp = experience(manager.start_date);

  return (
    <>
      {viewing && <ManagerDetailsModal manager={manager} onClose={() => setViewing(false)} />}
      <div
        className="flex cursor-pointer flex-wrap items-center gap-x-6 gap-y-4 rounded-[18px] bg-[#0c1b36] bg-[radial-gradient(560px_240px_at_100%_0%,rgba(34,195,230,0.25),transparent_70%)] px-6 py-6 text-white transition-transform hover:-translate-y-0.5"
        role="button"
        tabIndex={0}
        aria-label={`${manager.full_name}: məlumatlara bax`}
        onClick={() => setViewing(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && setViewing(true)}
      >
        <Avatar employee={manager} className="!h-24 !w-24 !text-2xl ring-4 ring-white/15" />
        <div className="min-w-0 flex-[1_1_240px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-frost">
            <Crown size={12} /> {manager.position ?? "Rəhbər"}
          </span>
          <h2 className="mt-1.5 truncate text-2xl font-extrabold">{manager.full_name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/65">
            <Briefcase size={14} className="text-white/45" /> {exp ? `Təcrübə: ${exp}` : "Təcrübə yazılmayıb"}
          </p>
        </div>
        {manager.phone ? (
          <a href={`tel:${manager.phone}`} onClick={(e) => e.stopPropagation()}
            className="btn shrink-0 !bg-white !text-[#0c1b36] hover:!bg-frost"><Phone size={16} /> {manager.phone}</a>
        ) : (
          <span className="flex shrink-0 items-center gap-1.5 text-sm text-white/50"><Phone size={15} /> Telefon yazılmayıb</span>
        )}
      </div>
    </>
  );
}
