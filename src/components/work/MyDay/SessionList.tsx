import { timeBaku } from "@/lib/attendance";
import type { SessionListProps } from "@/types/myWork";
import { durShort, mins } from "./dayTime";

// Bugünkü seanslar: hər biri ayrıca sətir, nömrə ilə (yalnız yenidən işə çıxanda)
export function SessionList({ sessions }: SessionListProps) {
  return (
    <ol className="divide-y divide-line rounded-xl border border-line">
      {sessions.map((x, i) => (
        <li key={x.in} className="flex items-center gap-3 px-3 py-2 text-sm">
          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${x.out ? "bg-bg text-muted" : "bg-ok text-white"}`}>{i + 1}</span>
          <span className="font-semibold tabular-nums">{timeBaku(x.in)} – {x.out ? timeBaku(x.out) : "…"}</span>
          <span className={`ml-auto text-xs font-semibold tabular-nums ${x.out ? "text-muted" : "text-ok"}`}>{x.out ? durShort(mins(x.in, x.out)) : "indi işdəsən"}</span>
        </li>
      ))}
    </ol>
  );
}
