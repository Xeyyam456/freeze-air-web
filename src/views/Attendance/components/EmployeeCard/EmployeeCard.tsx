"use client";

import type { EmployeeCardProps } from "@/types/attendance";
import { PersonPhoto } from "../PersonPhoto";
import { TodaySessions } from "../TodaySessions";

// Usta kartı (< 1280): ad, ixtisas, 4 göstərici (İşdə, İcazə, İcazəsiz, Bazar), bu gün + seanslar
export function EmployeeCard({ employee: e, summary: a, isMe, cell, onOpen }: EmployeeCardProps) {
  const cells: [string, React.ReactNode, string][] = [
    ["İşdə", a?.present ?? "…", "text-ok"],
    ["İcazə", a?.leaveTimes ? a.leave : "—", "text-violet-600"],
    ["İcazəsiz", a?.absent || "—", a?.absent ? "text-danger" : "text-muted"],
    ["Bazar", a?.extra || "—", "text-slate-600"],
  ];

  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(e)} onKeyDown={(ev) => ev.key === "Enter" && onOpen(e)}
      className={`card grow basis-[320px] cursor-pointer !p-4 max-sm:!p-2.5 transition-colors hover:bg-primary-soft/30 ${isMe ? "ring-2 ring-primary/30" : ""}`}>
      <div className="flex items-center gap-3 max-sm:gap-2">
        <PersonPhoto employee={e} className="h-10 w-10 max-sm:h-8 max-sm:w-8 max-sm:text-[10px]" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="truncate">{e.full_name}</span>
            {isMe && <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">Sən</span>}
          </span>
          <span className="muted block truncate text-xs">{e.specialty ?? ""}{a ? `${e.specialty ? " · " : ""}${a.workdays} iş günü` : ""}</span>
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5 max-sm:mt-2 max-sm:gap-1">
        {cells.map(([l, v, c]) => (
          <span key={l} className="min-w-0 rounded-xl bg-bg px-2.5 py-2 text-center max-sm:rounded-lg max-sm:px-1 max-sm:py-1">
            <span className="muted block whitespace-nowrap text-[11px] font-semibold max-sm:text-[10px] max-sm:leading-tight">{l}</span>
            <b className={`block text-[15px] tabular-nums max-sm:text-sm max-sm:leading-tight ${v === "—" ? "text-muted" : c}`}>{v}</b>
          </span>
        ))}
      </div>
      {cell && (
        <div className="mt-3 space-y-2 border-t border-line pt-3 max-sm:mt-2 max-sm:pt-2">
          <div className="flex flex-wrap items-center justify-end gap-2">{cell}</div>
          {a && <TodaySessions summary={a} />}
        </div>
      )}
    </div>
  );
}
