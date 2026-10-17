"use client";

import { useMemo, useState } from "react";
import { Briefcase, CalendarDays, ClipboardList, Phone, Search, User, Users, Wrench, X } from "lucide-react";
import { Modal } from "@/components/Modal";
import { WorkTab } from "@/components/work/WorkTab";
import type { Tables } from "@/lib/database.types";
import { experience, initials } from "@/lib/experience";

type Employee = Tables<"employees">;

// Ustada hazırda olan alət (qaytarılmamış)
// quantity: ustadakı say (bir alətdən bir neçə ədəd ola bilər)
export type HeldTool = { id: number; name: string; inventory_code: string | null; taken_at: string; quantity: number };

// Ustadakı ədədlərin cəmi
function toolCount(tools: HeldTool[]) {
  return tools.reduce((s, t) => s + t.quantity, 0);
}

// Axtarış üçün sadələşdirmə: "Əlizadə" və "elizade" eyni tapılsın.
function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

// Şəkil varsa şəkil, yoxdursa baş hərflər
export function Avatar({ employee, className = "" }: { employee: Pick<Employee, "full_name" | "photo_url">; className?: string }) {
  if (employee.photo_url) {
    // eslint-disable-next-line @next/next/no-img-element -- xarici avatar (SVG), optimizasiyaya ehtiyac yoxdur
    return <img src={employee.photo_url} alt={employee.full_name} className={`emp-avatar object-cover ${className}`} />;
  }
  return <span className={`emp-avatar ${className}`}>{initials(employee.full_name)}</span>;
}

function formatDate(d: string | null) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

// Usta kartına klikləyəndə açılan məlumat pəncərəsi
function EmployeeDetailsModal({ employee, tools, isMe, onClose }: {
  employee: Employee;
  tools: HeldTool[];
  isMe: boolean;
  onClose: () => void;
}) {
  const exp = experience(employee.start_date);
  // Öz kartını açan usta birbaşa işlərinə düşür
  const [tab, setTab] = useState<"about" | "tools" | "work">(isMe ? "work" : "about");

  const tabClass = (t: typeof tab) =>
    `flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${
      tab === t ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
    }`;

  return (
    <Modal onClose={onClose} labelledBy={`emp-${employee.id}-title`} className="!max-w-2xl overflow-hidden !p-0">
      {/* Başlıq zolağı: header ilə eyni rəng keçidi, şəkil zolağın üstünə çıxır */}
      <div className="relative h-24 bg-[linear-gradient(120deg,#0a1a33,#0f2a55_55%,#0e3b6e)]">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Bağla">
          <X size={18} />
        </button>
      </div>
      <div className="relative -mt-12 px-6 pb-6 text-center">
        <Avatar employee={employee} className="mx-auto !h-24 !w-24 !text-2xl ring-4 ring-white" />
        <h2 id={`emp-${employee.id}-title`} className="mt-3 text-xl font-bold">{employee.full_name}</h2>
        <p className="muted text-sm">{employee.specialty ?? "İxtisas yazılmayıb"}</p>

        <div className="mt-5 flex gap-1 rounded-xl bg-bg p-1" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "about"} onClick={() => setTab("about")} className={tabClass("about")}>
            <User size={15} /> Haqqında
          </button>
          <button type="button" role="tab" aria-selected={tab === "tools"} onClick={() => setTab("tools")} className={tabClass("tools")}>
            <Wrench size={15} /> Alətlər
            <span className="rounded-full bg-primary-soft px-1.5 text-xs text-primary">{toolCount(tools)}</span>
          </button>
          <button type="button" role="tab" aria-selected={tab === "work"} onClick={() => setTab("work")} className={tabClass("work")}>
            <ClipboardList size={15} /> İşlər
          </button>
        </div>

        {/* Bütün tablar eyni hündürlükdədir ki, keçid zamanı pəncərə tullanmasın */}
        <div className="mt-3 h-[min(340px,calc(100vh-330px))] text-left text-sm">
          {tab === "about" ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-bg px-3 py-2">
                <p className="muted flex items-center gap-1.5 text-xs font-medium"><Briefcase size={13} /> Təcrübə</p>
                <p className="font-semibold">{exp ?? "—"}</p>
              </div>
              <div className="rounded-xl bg-bg px-3 py-2">
                <p className="muted flex items-center gap-1.5 text-xs font-medium"><CalendarDays size={13} /> İşə başlayıb</p>
                <p className="font-semibold">{formatDate(employee.start_date) ?? "—"}</p>
              </div>
              <div className="col-span-2 rounded-xl bg-bg px-3 py-2">
                <p className="muted flex items-center gap-1.5 text-xs font-medium"><Phone size={13} /> Telefon</p>
                {employee.phone
                  ? <a href={`tel:${employee.phone}`} className="link">{employee.phone}</a>
                  : <p className="font-semibold">—</p>}
              </div>
            </div>
          ) : tab === "tools" ? (
            tools.length === 0 ? (
              <div className="grid h-full place-items-center rounded-xl border border-dashed border-line">
                <p className="muted text-sm">Ustanın üzərində alət yoxdur.</p>
              </div>
            ) : (
              // Üç sütun: çox alət olanda da sahə öz içində sürüşür, pəncərə böyümür
              <ul className="grid h-full auto-rows-min grid-cols-3 gap-1.5 overflow-y-auto">
                {tools.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 rounded-lg bg-bg px-3 py-1.5 text-[13px] font-medium" title={t.name}>
                    <Wrench size={13} className="shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate">{t.name}</span>
                    {t.quantity > 1 && <span className="shrink-0 rounded-full bg-primary-soft px-1.5 text-xs font-bold text-primary">×{t.quantity}</span>}
                  </li>
                ))}
              </ul>
            )
          ) : (
            <WorkTab employeeId={employee.id} employeeName={employee.full_name} />
          )}
        </div>
      </div>
    </Modal>
  );
}

function EmployeeCard({ employee, tools, todayCount, isMe }: {
  employee: Employee;
  tools: HeldTool[];
  todayCount: number;
  isMe: boolean;
}) {
  const [viewing, setViewing] = useState(false);
  const exp = experience(employee.start_date);

  return (
    <>
      {viewing && <EmployeeDetailsModal employee={employee} tools={tools} isMe={isMe} onClose={() => setViewing(false)} />}

      {/* Kartın istənilən yerinə klik məlumat pəncərəsini açır */}
      <div
        className={`store-card cursor-pointer ${isMe ? "!border-primary" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={`${employee.full_name}: məlumatlara bax`}
        onClick={() => setViewing(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget && setViewing(true)}
      >
        <div className="flex gap-4">
          <Avatar employee={employee} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-bold">{employee.full_name}</h3>
                <p className="muted text-[13px]">{employee.specialty ?? "İxtisas yazılmayıb"}</p>
              </div>
              {isMe && <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">Sən</span>}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-[13px]">
              <Phone size={14} className="muted shrink-0" />
              {employee.phone
                ? <a href={`tel:${employee.phone}`} className="link" onClick={(e) => e.stopPropagation()}>{employee.phone}</a>
                : <span className="muted">Telefon yoxdur</span>}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-line pt-3 text-xs font-semibold">
          <span className="flex items-center gap-2">
            <Briefcase size={14} className="text-primary" />
            {exp ? <span>Təcrübə: {exp}</span> : <span className="muted">İşə başlama tarixi yazılmayıb</span>}
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <span className={`flex items-center gap-1.5 ${todayCount ? "text-ok" : "muted"}`} title="Bu gün yazılan işlər">
              <ClipboardList size={13} /> Bu gün: {todayCount} iş
            </span>
            <span className={`flex items-center gap-1.5 ${tools.length ? "text-primary" : "muted"}`}>
              <Wrench size={13} /> {toolCount(tools)} alət
            </span>
          </span>
        </div>
      </div>
    </>
  );
}

// Ustalar siyahısı (yalnız baxış). Daxil olmuş usta öz kartını ən başda görür.
export function EmployeeList({ employees, toolsByEmployee, todayWork, myEmployeeId }: {
  employees: Employee[];
  toolsByEmployee: Record<number, HeldTool[]>;
  todayWork: Record<number, number>; // usta id → bu gün yazılan iş sayı
  myEmployeeId: number | null;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return employees
      .filter((e) => {
        const haystack = norm(`${e.full_name} ${e.specialty} ${e.phone}`);
        return words.every((w) => haystack.includes(w));
      })
      .sort((a, b) => Number(b.id === myEmployeeId) - Number(a.id === myEmployeeId));
  }, [employees, query, myEmployeeId]);

  if (employees.length === 0) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><Users size={20} /></span>
        <p className="mt-3 font-semibold">Hələ usta yoxdur</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="search sticky top-0 z-10 rounded-[14px] shadow-[0_0_0_16px_#f8f9fc]">
        <Search size={20} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad, ixtisas və ya telefon ilə axtar..."
          aria-label="Usta axtarışı"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="card muted py-10 text-center text-sm">Bu axtarışa uyğun usta tapılmadı.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((e) => (
            <EmployeeCard key={e.id} employee={e} tools={toolsByEmployee[e.id] ?? []} todayCount={todayWork[e.id] ?? 0} isMe={e.id === myEmployeeId} />
          ))}
        </div>
      )}
    </div>
  );
}
