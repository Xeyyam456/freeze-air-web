import { Avatar } from "@/shared/components/Avatar";
import type { TeamGroupCardProps } from "@/types/myTasks";
import { TeamTaskLine } from "../TeamTaskLine";

// Başqalarının qrup tapşırığı: üzvlər birlikdə, tapşırıq bir sətir
export function TeamGroupCard({ g, employees, logOf, onViewLog }: TeamGroupCardProps) {
  const t = g.live[0] ?? g.rows[0];
  const cancelled = g.live.length === 0;
  const done = !cancelled && g.live.every((x) => x.done);
  const members = g.live.map((x) => employees.find((e) => e.id === x.employee_id)).filter((e) => !!e);
  return (
    <section className="card min-w-0 grow basis-[340px] !p-4 max-sm:!p-3">
      <header className="flex items-center gap-3">
        <span className="flex -space-x-2.5">
          {members.map((e) => <Avatar key={e.id} employee={e} className="!h-9 !w-9 !text-xs ring-2 ring-white" />)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{members.map((e) => e.full_name).join(" + ") || "Qrup"}</span>
          <span className="muted block text-xs">Qrup · {members.length} nəfər</span>
        </span>
        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700">Qrup</span>
        {done && <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-bold text-ok">Hazır</span>}
      </header>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg">
        <div className="h-full rounded-full bg-gradient-to-r from-ok to-[#4ade80] transition-[width] duration-500" style={{ width: done ? "100%" : "0%" }} />
      </div>
      <ul className="mt-3 space-y-2">
        <TeamTaskLine t={t} cancelled={cancelled} done={done} showNext={false} logId={logOf(t)} onViewLog={onViewLog} />
      </ul>
    </section>
  );
}
