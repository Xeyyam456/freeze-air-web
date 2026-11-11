import s from "./HeroSteam.module.css";

// Soyuq şüşədə buxar dumanı: yuxarıdan tədricən sönən yumşaq qat (yalnız CSS). Süzülən zolaqlar və damcılar
// ayrıca canvas-dadır (DropsCanvas): real kondensasiya kimi damcı buxarı silib təmiz iz qoyur.
// Görünürlüyü --steam (0–1) təyin edir: temperatur sürgüsü 16–18°-yə düşəndə açılır.
export function HeroSteam() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative col-start-1 row-start-1 overflow-hidden transition-opacity duration-700" style={{ opacity: "var(--steam, 0)" }}>
      <span className={s.haze} />
    </div>
  );
}
