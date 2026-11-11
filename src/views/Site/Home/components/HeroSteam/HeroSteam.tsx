import s from "./HeroSteam.module.css";

// Zolaqların yeri (%), eni (px), hündürlüyü (%), müddəti və gecikməsi
const STREAMS = [
  { x: 6, w: 34, h: 85, dur: "13s", delay: "0s" }, { x: 17, w: 20, h: 70, dur: "10s", delay: "3s" },
  { x: 29, w: 44, h: 90, dur: "15s", delay: "6s" }, { x: 41, w: 18, h: 65, dur: "9s", delay: "1.5s" },
  { x: 52, w: 36, h: 80, dur: "12s", delay: "8s" }, { x: 63, w: 24, h: 75, dur: "11s", delay: "4.5s" },
  { x: 74, w: 40, h: 88, dur: "14s", delay: "2s" }, { x: 84, w: 22, h: 72, dur: "10s", delay: "7s" },
  { x: 93, w: 30, h: 82, dur: "13s", delay: "5s" },
];

// Soyuq şüşədə buxar: yuxarıdan tədricən sönən duman və ondan aşağı süzülən nəm zolaqlar (yalnız CSS).
// Görünürlüyü --steam (0–1) təyin edir: temperatur sürgüsü 16–18°-yə düşəndə açılır.
export function HeroSteam() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative col-start-1 row-start-1 overflow-hidden transition-opacity duration-700" style={{ opacity: "var(--steam, 0)" }}>
      <span className={s.haze} />
      {STREAMS.map((p, i) => (
        <span key={i} className={s.stream} style={{ left: `${p.x}%`, width: p.w, height: `${p.h}%`, animationDuration: p.dur, animationDelay: p.delay }} />
      ))}
    </div>
  );
}
