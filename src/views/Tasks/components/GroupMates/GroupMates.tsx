import { Avatar } from "@/shared/components/Avatar";
import type { GroupMatesProps } from "@/types/myTasks";

// Qrup tapşırığı (0071): yoldaşlar; biri «görüldü» basanda hamı üçün görülür
export function GroupMates({ t, data }: GroupMatesProps) {
  const others = data.tasks.filter((x) => x.group_id === t.group_id && x.id !== t.id && !x.cancelled_at)
    .map((x) => data.employees.find((e) => e.id === x.employee_id)).filter((e) => !!e);
  if (others.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" title="Biri «görüldü» basanda hamı üçün görülür">
      {others.map((e) => (
        <span key={e.id} className="inline-flex min-w-0 grow basis-[140px] items-center gap-2 rounded-lg bg-violet-50/70 px-2 py-1 text-xs">
          <Avatar employee={e} className="!h-5 !w-5 !text-[8px] !shadow-none" />
          <b className="truncate text-ink">{e.full_name}</b>
        </span>
      ))}
    </div>
  );
}
