import type { MiniBarsProps } from "@/types/panelDash";
import s from "./MiniBars.module.css";

// Kiçik sütun qrafiki (son günlər): hündürlük = iş sayı, sonuncu bu gündür; üstünə gələndə ipucu
export function MiniBars({ bars }: MiniBarsProps) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className={s.root} role="img" aria-label={bars.map((b) => b.tip).join(", ")}>
      {bars.map((b, i) => (
        <span key={i} className={s.col} data-tip={b.tip}>
          <span className={`${s.bar} ${i === bars.length - 1 ? s.today : ""}`}
            style={{ height: `${Math.max(6, (b.value / max) * 100)}%`, "--i": i } as React.CSSProperties} />
          <small>{b.label}</small>
        </span>
      ))}
    </div>
  );
}
