"use client";

import { useMemo, useState } from "react";
import { Briefcase, CalendarDays, Car, ClipboardList, Phone, Search, User, Users, X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { WorkTab } from "@/components/work/WorkTab";
import type { Tables } from "@/types/database";
import { experience, initials } from "@/lib/experience";
import { PersonCard, type PersonStatus } from "./PersonCard";

export type TodayStatus = PersonStatus;

type Employee = Tables<"employees">;

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
function EmployeeDetailsModal({ employee, isMe, onClose }: {
  employee: Employee;
  isMe: boolean;
  onClose: () => void;
}) {
  const exp = experience(employee.start_date);
  // Öz kartını açan usta birbaşa işlərinə düşür
  const [tab, setTab] = useState<"about" | "work">(isMe ? "work" : "about");

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
              <div className="rounded-xl bg-bg px-3 py-2">
                <p className="muted flex items-center gap-1.5 text-xs font-medium"><Phone size={13} /> Telefon</p>
                {employee.phone
                  ? <a href={`tel:${employee.phone}`} className="link whitespace-nowrap max-[400px]:text-xs">{employee.phone}</a>
                  : <p className="font-semibold">—</p>}
              </div>
              {/* Maşın (0076): admin paneldə yazılır */}
              <div className="rounded-xl bg-bg px-3 py-2">
                <p className="muted flex items-center gap-1.5 text-xs font-medium"><Car size={13} /> Maşın</p>
                {employee.has_car
                  ? <p className="font-semibold"><span className="plate">{employee.car_plate ?? "Nömrə yazılmayıb"}</span>{employee.car_model && <span className="muted ml-1.5 text-xs font-medium">{employee.car_model}</span>}</p>
                  : <p className="muted font-semibold">Yoxdur</p>}
              </div>
            </div>
          ) : (
            <WorkTab employeeId={employee.id} employeeName={employee.full_name} />
          )}
        </div>
      </div>
    </Modal>
  );
}

function EmployeeCard({ employee, todayCount, monthCount, status, isMe }: {
  employee: Employee;
  todayCount: number;
  monthCount: number;
  status?: TodayStatus;
  isMe: boolean;
}) {
  const [viewing, setViewing] = useState(false);

  return (
    <>
      {viewing && <EmployeeDetailsModal employee={employee} isMe={isMe} onClose={() => setViewing(false)} />}
      <PersonCard
        person={employee}
        subtitle={employee.specialty ?? "İxtisas yazılmayıb"}
        badge={isMe ? "Sən" : undefined}
        highlight={isMe}
        status={status}
        stats={[
          { label: "Bu gün iş", value: todayCount, tone: todayCount ? "text-ok" : "" },
          { label: "Bu ay iş", value: monthCount, tone: monthCount ? "text-primary" : "" },
        ]}
        onOpen={() => setViewing(true)}
      />
    </>
  );
}

// Ustalar: yapışan axtarış, profil kartları (tünd xülasə 2026-10-28 silindi, admin kimi). Daxil olmuş usta öz kartını ən başda görür.
export function EmployeeList({ employees, todayWork, monthWork, status, myEmployeeId }: {
  employees: Employee[];
  todayWork: Record<number, number>; // usta id → bu gün yazılan iş sayı
  monthWork: Record<number, number>; // usta id → bu ay yazılan iş sayı
  status: Record<number, TodayStatus>; // usta id → bu günkü davamiyyət vəziyyəti
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
    <div className="space-y-5">
      {/* Axtarış üst zolağın altında yapışıq qalır */}
      <div className="sticky top-[var(--topbar-h)] z-20 -mx-1 bg-bg/90 px-1 py-2 backdrop-blur">
        <label className="flex h-11 items-center gap-2.5 rounded-xl bg-surface px-3.5 ring-1 ring-line focus-within:ring-2 focus-within:ring-primary">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ad, ixtisas və ya telefon ilə axtar..."
            aria-label="Usta axtarışı"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-muted hover:text-ink" aria-label="Axtarışı təmizlə">
              <X size={16} />
            </button>
          )}
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="card muted py-10 text-center text-sm">Bu axtarışa uyğun usta tapılmadı.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => (
            <EmployeeCard key={e.id} employee={e} todayCount={todayWork[e.id] ?? 0} monthCount={monthWork[e.id] ?? 0}
              status={status[e.id]} isMe={e.id === myEmployeeId} />
          ))}
        </div>
      )}
    </div>
  );
}
