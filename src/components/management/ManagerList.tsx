"use client";

import { useState } from "react";
import { Briefcase, CalendarDays, Crown, Phone, UserCog, X } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Avatar } from "@/components/employees/EmployeeList";
import { PersonCard } from "@/components/employees/PersonCard";
import type { Tables } from "@/lib/database.types";
import { experience } from "@/lib/experience";

type Manager = Tables<"employees">;

function formatDate(d: string | null) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

// Rəhbərin məlumat pəncərəsi (yalnız baxış)
function ManagerDetailsModal({ manager, onClose }: { manager: Manager; onClose: () => void }) {
  const exp = experience(manager.start_date);

  return (
    <Modal onClose={onClose} labelledBy={`mgr-${manager.id}-title`} className="!max-w-xl overflow-hidden !p-0">
      <div className="relative h-24 bg-[linear-gradient(120deg,#0a1a33,#0f2a55_55%,#0e3b6e)]">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Bağla">
          <X size={18} />
        </button>
      </div>
      <div className="relative -mt-12 px-6 pb-6 text-center">
        <Avatar employee={manager} className="mx-auto !h-24 !w-24 !text-2xl ring-4 ring-white" />
        <h2 id={`mgr-${manager.id}-title`} className="mt-3 text-xl font-bold">{manager.full_name}</h2>
        <p className="muted text-sm">{manager.position}</p>

        <div className="mt-5 grid grid-cols-2 gap-2 text-left text-sm">
          <div className="rounded-xl bg-bg px-3 py-2">
            <p className="muted flex items-center gap-1.5 text-xs font-medium"><Briefcase size={13} /> Təcrübə</p>
            <p className="font-semibold">{exp ?? "—"}</p>
          </div>
          <div className="rounded-xl bg-bg px-3 py-2">
            <p className="muted flex items-center gap-1.5 text-xs font-medium"><CalendarDays size={13} /> İşə başlayıb</p>
            <p className="font-semibold">{formatDate(manager.start_date) ?? "—"}</p>
          </div>
          <div className="col-span-2 rounded-xl bg-bg px-3 py-2">
            <p className="muted flex items-center gap-1.5 text-xs font-medium"><Phone size={13} /> Telefon</p>
            {manager.phone
              ? <a href={`tel:${manager.phone}`} className="link">{manager.phone}</a>
              : <p className="font-semibold">—</p>}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Vəzifə sırası: müdir ən üstdə, sonra servis müdirləri, sonra qalanlar (maliyyəçi və s.)
function rank(position: string | null) {
  const p = (position ?? "").toLocaleLowerCase("az");
  if (p === "müdir") return 0;
  if (p.includes("müdir")) return 1;
  return 2;
}

// Müdirin iri tünd kartı (rəhbərliyin başı)
function LeadCard({ manager }: { manager: Manager }) {
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

function ManagerCard({ manager }: { manager: Manager }) {
  const [viewing, setViewing] = useState(false);
  return (
    <>
      {viewing && <ManagerDetailsModal manager={manager} onClose={() => setViewing(false)} />}
      <PersonCard person={manager} subtitle={manager.position ?? "Rəhbərlik"} onOpen={() => setViewing(true)} />
    </>
  );
}

// Rəhbərlik (yalnız baxış): müdir üstdə iri kartda, altında digər rəhbərlər; klik → məlumat pəncərəsi
export function ManagerList({ managers }: { managers: Manager[] }) {
  if (managers.length === 0) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><UserCog size={20} /></span>
        <p className="mt-3 font-semibold">Hələ rəhbər əlavə olunmayıb</p>
      </div>
    );
  }

  const sorted = [...managers].sort((a, b) => rank(a.position) - rank(b.position) || a.full_name.localeCompare(b.full_name, "az"));
  const [lead, ...rest] = rank(sorted[0].position) === 0 ? sorted : [null, ...sorted];

  return (
    <div className="space-y-6">
      {lead && <LeadCard manager={lead} />}
      {rest.length > 0 && (
        <section>
          <h2 className="muted mb-3 text-xs font-semibold uppercase tracking-wider">{lead ? "Komanda rəhbərləri" : "Rəhbərlik"} · {rest.length}</h2>
          <div className="flex flex-wrap gap-4">
            {rest.map((m) => m && <div key={m.id} className="flex min-w-0 grow basis-[320px] [&>*]:flex-1"><ManagerCard manager={m} /></div>)}
          </div>
        </section>
      )}
    </div>
  );
}
