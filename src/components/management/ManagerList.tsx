"use client";

import { useState } from "react";
import { Briefcase, CalendarDays, Phone, UserCog, X } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Avatar } from "@/components/employees/EmployeeList";
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

function ManagerCard({ manager }: { manager: Manager }) {
  const [viewing, setViewing] = useState(false);
  const exp = experience(manager.start_date);

  return (
    <>
      {viewing && <ManagerDetailsModal manager={manager} onClose={() => setViewing(false)} />}
      <div
        className="store-card cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`${manager.full_name}: məlumatlara bax`}
        onClick={() => setViewing(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && setViewing(true)}
      >
        <div className="flex gap-4">
          <Avatar employee={manager} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-bold">{manager.full_name}</h3>
            <p className="muted text-[13px]">{manager.position}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[13px]">
              <Phone size={14} className="muted shrink-0" />
              {manager.phone
                ? <a href={`tel:${manager.phone}`} className="link" onClick={(e) => e.stopPropagation()}>{manager.phone}</a>
                : <span className="muted">Telefon yoxdur</span>}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-dashed border-line pt-3 text-xs font-semibold">
          <Briefcase size={14} className="text-primary" />
          {exp ? <span>Təcrübə: {exp}</span> : <span className="muted">İşə başlama tarixi yazılmayıb</span>}
        </div>
      </div>
    </>
  );
}

export function ManagerList({ managers }: { managers: Manager[] }) {
  if (managers.length === 0) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><UserCog size={20} /></span>
        <p className="mt-3 font-semibold">Hələ rəhbər əlavə olunmayıb</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {managers.map((m) => <ManagerCard key={m.id} manager={m} />)}
    </div>
  );
}
