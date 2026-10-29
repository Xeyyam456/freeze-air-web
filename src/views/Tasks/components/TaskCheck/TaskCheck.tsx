import { Check, Undo2 } from "lucide-react";
import type { TaskCheckProps } from "@/types/myTasks";

// "Görüldü" dairəsi: geri alınmış və keçmiş gündə bağlıdır
export function TaskCheck({ t, past, onToggle }: TaskCheckProps) {
  const cancelled = !!t.cancelled_at;
  return (
    <button type="button" disabled={cancelled || past} onClick={onToggle} aria-pressed={t.done}
      title={cancelled ? "Geri alınıb" : past ? "Keçmiş günün tapşırığı dəyişdirilmir" : t.done ? "Görülməyib kimi işarələ" : "Görüldü kimi işarələ"}
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all disabled:cursor-default ${
        cancelled ? "border-line bg-bg text-muted"
          : t.done ? "border-ok bg-ok text-white shadow-[0_4px_10px_-4px_rgba(18,161,80,0.8)]"
          : past ? "border-line bg-bg text-transparent"
          : "border-[#c9dafb] text-transparent hover:border-ok hover:bg-ok-soft hover:text-ok"}`}>
      {cancelled ? <Undo2 size={12} strokeWidth={2.6} /> : <Check size={13} strokeWidth={3} />}
    </button>
  );
}
