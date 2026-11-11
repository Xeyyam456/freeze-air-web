import s from "./HeroCold.module.css";

// Buz parıltılarının yeri (%), ölçüsü (px) və gecikməsi
const SPARKS = [
  { x: 48, y: 14, size: 22, delay: "0s" }, { x: 58, y: 62, size: 16, delay: "1.1s" }, { x: 66, y: 28, size: 25, delay: "2.2s" },
  { x: 74, y: 78, size: 18, delay: "0.5s" }, { x: 80, y: 16, size: 20, delay: "1.7s" }, { x: 86, y: 52, size: 27, delay: "2.9s" },
  { x: 92, y: 30, size: 16, delay: "0.9s" }, { x: 95, y: 70, size: 22, delay: "2.5s" }, { x: 54, y: 40, size: 14, delay: "3.3s" },
  { x: 70, y: 48, size: 18, delay: "1.4s" }, { x: 62, y: 86, size: 23, delay: "0.2s" }, { x: 88, y: 88, size: 16, delay: "3.7s" },
];

// Soyuq hava axını: kondisionerdən sola-aşağı süzülən buzlu duman və parıldayan buz kristalları (yalnız CSS).
// Görünürlüyü --cold (0–1) təyin edir: temperatur sürgüsü 20°-dən aşağı olanda açılır.
export function HeroCold() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative col-start-1 row-start-1 overflow-hidden mix-blend-screen transition-opacity duration-700" style={{ opacity: "var(--cold, 0)" }}>
      <span className={`${s.mist} ${s.m1}`} />
      <span className={`${s.mist} ${s.m2}`} />
      <span className={`${s.mist} ${s.m3}`} />
      {SPARKS.map((p, i) => (
        <span key={i} className={s.spark} style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, animationDelay: p.delay }} />
      ))}
    </div>
  );
}
