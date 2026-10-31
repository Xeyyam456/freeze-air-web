import { Avatar } from "@/shared/components/Avatar";
import type { TeamEmployeeCardProps } from "@/types/myTasks";
import { TeamTaskLine } from "../TeamTaskLine";
import { Card } from "@/shared/components/Card";

// Başqa ustanın tək tapşırıqları: "N/M görülüb", irəliləmə zolağı, tapşırıq sətirləri
export function TeamEmployeeCard({ employee, items, logOf, onViewLog }: TeamEmployeeCardProps) {
  const liveItems = items.filter((t) => !t.cancelled_at);
  const done = liveItems.filter((t) => t.done).length;
  return (
    <Card as="section" className="min-w-0 grow basis-[340px] !p-4 max-sm:!p-3">
      <header className="flex items-center gap-3">
        <Avatar employee={employee} className="!h-9 !w-9 !text-xs" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{employee.full_name}</span>
          <span className="muted block text-xs">{done}/{liveItems.length} görülüb</span>
        </span>
        {liveItems.length > 0 && done === liveItems.length && <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-bold text-ok">Hazır</span>}
      </header>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg">
        <div className="h-full rounded-full bg-gradient-to-r from-ok to-[#4ade80] transition-[width] duration-500"
          style={{ width: `${liveItems.length ? (done / liveItems.length) * 100 : 0}%` }} />
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((t) => <TeamTaskLine key={t.id} t={t} cancelled={!!t.cancelled_at} done={!!t.done} showNext logId={logOf(t)} onViewLog={onViewLog} />)}
      </ul>
    </Card>
  );
}
