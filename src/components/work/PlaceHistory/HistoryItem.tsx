import { MapPin } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import type { HistoryItemProps } from "@/types/myWork";
import { FileBadges } from "../FileBadges";
import { bakuTime } from "../time";

// Tarixçədə iş: usta, (şirkətdə) filial, görülən iş, saat, fayl nişanları
export function HistoryItem({ r, showStore, onOpen }: HistoryItemProps) {
  return (
    <li>
      <button type="button" onClick={() => onOpen(r.id)}
        className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-bg">
        <Avatar employee={{ full_name: r.employees?.full_name ?? "?", photo_url: r.employees?.photo_url ?? null }} className="!h-10 !w-10 shrink-0 !text-xs" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-semibold">{r.employees?.full_name ?? "—"}</span>
            {showStore && r.stores && (
              <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-primary">
                <MapPin size={12} className="shrink-0" /> <span className="truncate">{r.stores.code} {r.stores.name}</span>
              </span>
            )}
          </p>
          <p className="muted mt-0.5 line-clamp-2 text-sm">{r.description}</p>
        </div>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm font-semibold tabular-nums">{bakuTime(r.created_at)}</span>
          <FileBadges files={r.files} />
        </span>
      </button>
    </li>
  );
}
