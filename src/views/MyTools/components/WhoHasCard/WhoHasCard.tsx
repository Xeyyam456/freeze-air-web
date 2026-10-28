import { useState } from "react";
import { ChevronRight, Search, Users } from "lucide-react";
import { norm } from "@/shared/utils/norm";
import { Avatar } from "@/components/employees/EmployeeList";
import type { Held } from "@/types/myTools/Held";
import type { Person } from "@/types/myTools/Person";
import { groupPeople, counts } from "@/views/MyTools/utils/people";
import { PersonView } from "@/views/MyTools/components/PersonView";

// "Kimdə nə var" (2026-10-24, paneldən köçdü): bütün ustaların üzərindəkilər. Kartda usta siyahısı, basanda pəncərə (yalnız baxış).

export function WhoHasCard({ all, me }: { all: Held[]; me: number }) {
  const [open, setOpen] = useState<Person | null>(null);
  const [q, setQ] = useState("");
  const people = groupPeople(all, me).filter((p) => norm(p.name).includes(norm(q.trim())) || p.items.some((h) => norm(h.tools?.name).includes(norm(q.trim()))));
  return (
    <section className="absolute inset-0 flex flex-col rounded-3xl border border-line bg-surface p-5">
      {open && <PersonView p={open} me={me} onClose={() => setOpen(null)} />}
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#a78bfa,#7c3aed)] text-white shadow-[0_8px_18px_-6px_rgba(124,58,237,0.55)]"><Users size={18} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold leading-tight">Kimdə nə var</h2>
          <p className="muted text-xs">{people.length} ustanın üzərində əşya var</p>
        </div>
      </div>
      <label className="relative mb-3 block">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Usta və ya alət axtar..." aria-label="Axtar" className="field !h-9 !rounded-xl !pl-9 !text-[13px]" />
      </label>
      {people.length === 0 ? (
        <p className="muted grid flex-1 place-items-center rounded-2xl border border-dashed border-line text-center text-sm">{q ? "Heç nə tapılmadı" : "Heç kimdə heç nə yoxdur"}</p>
      ) : (
        <ul className="-mx-1 min-h-0 flex-1 space-y-1 overflow-y-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {people.map((p) => {
            const c = counts(p);
            return (
              <li key={p.id}>
                <button type="button" onClick={() => setOpen(p)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors hover:bg-[#f6f3ff] ${p.id === me ? "bg-primary-soft/40" : ""}`}>
                  <Avatar employee={{ full_name: p.name, photo_url: p.photo }} className="!h-9 !w-9 !text-[11px]" />
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-[13.5px] font-semibold group-hover:text-[#6d28d9]">{p.name}{p.id === me && <span className="ml-1.5 rounded-full bg-primary px-1.5 py-px text-[10px] font-bold text-white">Sən</span>}</b>
                    <span className="muted block truncate text-xs">{c.tools ? `${c.tools} alət` : ""}{c.tools && c.mats ? " · " : ""}{c.mats ? `${c.mats} material` : ""}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-[#6d28d9]" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
