import { CornerDownLeft } from "lucide-react";
import type { CommandRowProps } from "@/types/panel";

// Nəticə sətri; head — qrup başlığı (qrupun ilk sətrində)
export function CommandRow({ item, index, current, head, onHover }: CommandRowProps) {
  const Icon = item.icon;
  return (
    <div>
      {head && <p className="cmdk-group">{head}</p>}
      <button type="button" role="option" data-index={index} className="cmdk-item" aria-selected={current}
        onMouseMove={() => !current && onHover(index)} onClick={item.run}>
        <span className="cmdk-icon"><Icon size={17} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{item.label}</span>
          {item.hint && <span className="block truncate text-xs text-muted">{item.hint}</span>}
        </span>
        {current && <CornerDownLeft size={15} className="shrink-0 text-muted" />}
      </button>
    </div>
  );
}
