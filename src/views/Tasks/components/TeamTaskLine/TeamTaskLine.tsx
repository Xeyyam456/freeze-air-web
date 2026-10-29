import { Check, Undo2 } from "lucide-react";
import { FileBadges } from "@/components/work/FileBadges";
import type { TeamTaskLineProps } from "@/types/myTasks";
import { fileTotal, placeOf } from "../../utils/place";

// Komanda kartında tapşırıq sətri: vəziyyət, yer, səbəb (tək tapşırıqda "→ yeni usta"); fayl nişanı, klik → iş pəncərəsi
export function TeamTaskLine({ t, cancelled, done, showNext, logId, onViewLog }: TeamTaskLineProps) {
  return (
    <li className={`flex items-start gap-2.5 text-sm ${cancelled ? "opacity-60" : ""}`}>
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
        cancelled ? "bg-bg text-muted" : done ? "bg-ok text-white" : "border-2 border-line"}`}>
        {cancelled ? <Undo2 size={11} strokeWidth={3} /> : done ? <Check size={12} strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`line-clamp-2 font-semibold ${cancelled ? "text-muted line-through" : done ? "text-ok" : ""}`}>{placeOf(t)}</span>
        <span className={`block truncate text-xs ${cancelled ? "line-through" : ""} text-muted`}>
          {t.reason}{showNext && cancelled && t.nextName && <> · → {t.nextName}</>}
        </span>
        {logId && fileTotal(t) > 0 && (
          <button type="button" onClick={() => onViewLog(logId)} title="Akt, şəkil və videoya bax" className="mt-1 rounded-full hover:opacity-80">
            <FileBadges files={t.files} />
          </button>
        )}
      </span>
    </li>
  );
}
