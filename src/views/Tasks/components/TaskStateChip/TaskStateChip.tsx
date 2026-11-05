import { ArrowRight } from "lucide-react";
import type { TaskStateChipProps } from "@/types/myTasks";

// Vəziyyət: geri alınıb (→ yeni usta) / görüldü / görülmədi (keçmiş gün) / gözləyir
export function TaskStateChip({ t, past }: TaskStateChipProps) {
  if (t.cancelled_at) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-bg px-2.5 py-1 text-xs font-semibold text-muted">
      Geri alınıb{t.nextName && <><ArrowRight size={12} /> {t.nextName}</>}
    </span>
  );
  if (t.done) return <span className="rounded-full bg-ok-soft px-2.5 py-1 text-xs font-bold text-ok">Görüldü</span>;
  if (past) return <span className="rounded-full bg-red-500/12 px-2.5 py-1 text-xs font-bold text-orange-300">Görülmədi</span>;
  return <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">Gözləyir</span>;
}
