import type { DaysTableProps } from "@/types/myWork";
import { MONTHS, WEEKDAYS } from "../../utils/chart";

// Cədvəl görünüşü: iş olan günlər və cəmi
export function DaysTable({ y, m, stats }: DaysTableProps) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs font-semibold text-white/70"><tr><th className="py-2">Gün</th><th className="py-2 text-right">İş sayı</th></tr></thead>
      <tbody>
        {stats.counts.map((c, i) => c > 0 && (
          <tr key={i} className="border-t border-white/20">
            <td className="py-2">{i + 1} {MONTHS[m].toLowerCase()}, {WEEKDAYS[new Date(y, m, i + 1).getDay()]}</td>
            <td className="py-2 text-right font-bold tabular-nums">{c}</td>
          </tr>
        ))}
        <tr className="border-t border-white/30 font-extrabold"><td className="py-2">Cəmi</td><td className="py-2 text-right tabular-nums">{stats.total}</td></tr>
      </tbody>
    </table>
  );
}
