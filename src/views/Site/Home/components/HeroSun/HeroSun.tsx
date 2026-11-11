import s from "./HeroSun.module.css";

// Günəş: pəncərədən düşən işıq şüaları, parıltı və yuxarı qalxan istilik dalğaları (yalnız CSS).
// Görünürlüyü --sun (0–1) təyin edir: temperatur sürgüsü 25°-dən yuxarı olanda açılır.
export function HeroSun() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative col-start-1 row-start-1 overflow-hidden mix-blend-screen transition-opacity duration-700" style={{ opacity: "var(--sun, 0)" }}>
      <span className={s.glow} />
      <span className={`${s.rays} ${s.a}`} />
      <span className={`${s.rays} ${s.b}`} />
      <span className={s.heat} />
    </div>
  );
}
