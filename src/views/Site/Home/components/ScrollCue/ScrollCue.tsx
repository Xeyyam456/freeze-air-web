import type { ScrollCueProps } from "@/types/site";
import s from "./ScrollCue.module.css";

// Hero-nun altında "aşağı sürüşdürün" işarəsi: siçan ikonu (təkəri enir) + yazı. Səhifə sürüşəndə tədricən itir
// (CSS scroll-driven, JS yoxdur). Yalnız ≥ 1024: kiçik ekranlarda mətn hero-nun altındadır və sürüşdürmə təbiidir.
export function ScrollCue({ text }: ScrollCueProps) {
  return (
    <div aria-hidden="true" className="hero-in pointer-events-none absolute inset-x-0 bottom-[8rem] z-20 hidden justify-center lg:flex" style={{ "--d": "1800ms" } as React.CSSProperties}>
      <div className={s.cue}>
        <span className={s.mouse}><span className={s.wheel} /></span>
        <span className={s.text}>{text}</span>
      </div>
    </div>
  );
}
