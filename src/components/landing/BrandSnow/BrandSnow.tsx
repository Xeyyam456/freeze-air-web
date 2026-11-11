import type { CSSProperties } from "react";
import { SHAPES } from "./shapes";
import s from "./BrandSnow.module.css";

// Qar dənələri: forma (SHAPES), ölçü (px), mətnin sağ kənarından məsafə (hamısı yazının sonunda toplanır), yana sürüşmə, müddət, gecikmə, rəng.
// Altısı həmişə görünür, qalanı yalnız soyuqda (extra) çoxalır.
const FLAKES = [
  { k: 0, size: 18, right: -16, dx: "10px", dur: "8s", delay: "0s", c: "#4cc3ee" },
  { k: 3, size: 11, right: -8, dx: "-8px", dur: "6s", delay: "1.2s", c: "#8fe0ff" },
  { k: 2, size: 15, right: -2, dx: "14px", dur: "9s", delay: "2.4s", c: "#38b2e6" },
  { k: 1, size: 13, right: 6, dx: "-12px", dur: "7.5s", delay: "0.6s", c: "#62cdf5" },
  { k: 0, size: 20, right: 14, dx: "9px", dur: "9.5s", delay: "3.6s", c: "#2fa8de" },
  { k: 3, size: 9, right: 22, dx: "-6px", dur: "5.5s", delay: "4.8s", c: "#a8ebff" },
  { k: 1, size: 16, right: -12, dx: "12px", dur: "9s", delay: "1.8s", c: "#4cc3ee" },
  { k: 2, size: 12, right: -4, dx: "-10px", dur: "7s", delay: "5.6s", c: "#6fd3f7" },
  { k: 0, size: 14, right: 2, dx: "8px", dur: "8s", delay: "3s", c: "#38b2e6" },
  { k: 3, size: 10, right: 10, dx: "-7px", dur: "5.8s", delay: "6.4s", c: "#8fe0ff" },
  { k: 2, size: 17, right: 18, dx: "11px", dur: "9s", delay: "4.2s", c: "#4cc3ee" },
  { k: 0, size: 12, right: 26, dx: "-9px", dur: "7.8s", delay: "2s", c: "#62cdf5" },
];

// Loqo adının üstündən süzülən qar kristalları: hər dənə yellənərək enir, üç ölçülü çevrilir (sanki havada fırlanır),
// parıldayır və əriyir (yalnız CSS). Ata element `relative inline-block` olmalıdır (dənələr mətnin alt kənarına bağlanır).
export function BrandSnow() {
  return FLAKES.map((f, i) => (
    <span key={i} aria-hidden="true" className={`${s.flake} ${i >= 6 ? s.extra : ""}`} style={{ right: f.right, width: f.size, height: f.size, color: f.c, "--dx": f.dx, animationDuration: f.dur, animationDelay: f.delay } as CSSProperties}>
      <span className={s.sway} style={{ animationDuration: `${parseFloat(f.dur) / 2.4}s`, animationDelay: f.delay }}>
        <svg viewBox="-10 -10 20 20" className={s.spin} style={{ animationDuration: `${parseFloat(f.dur) * 0.7}s`, animationDelay: f.delay }}>{SHAPES[f.k]}</svg>
      </span>
    </span>
  ));
}
