import type { HeroTitleProps } from "@/types/site";
import s from "./HeroTitle.module.css";
// Hero başlığı: sözlər bir-bir bulanıqdan aydına keçərək görünür (yalnız CSS, `.word-in`)
export function HeroTitle({ text, className = "" }: HeroTitleProps) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <h1 className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className={i === words.length - 1 ? `${s.word} ${s.shine}` : s.word} style={{ "--d": `${120 + i * 90}ms` } as React.CSSProperties}>
          {w}{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  );
}
