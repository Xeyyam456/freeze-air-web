import { Snowflake } from "lucide-react";
import s from "./BrandSnow.module.css";

// Qar dənələri: ölçü (px), mətnin sağ kənarından məsafə, yana sürüşmə, müddət və gecikmə
const FLAKES = [
  { size: 9, right: -8, dx: "10px", dur: "7s", delay: "0s" },
  { size: 6, right: 4, dx: "-8px", dur: "8s", delay: "1.2s" },
  { size: 11, right: 14, dx: "14px", dur: "9s", delay: "2.4s" },
  { size: 7, right: 26, dx: "-12px", dur: "7.5s", delay: "0.6s" },
  { size: 8, right: 38, dx: "9px", dur: "8.5s", delay: "3.6s" },
  { size: 5, right: 50, dx: "-6px", dur: "6.5s", delay: "4.8s" },
  { size: 10, right: 62, dx: "12px", dur: "9.5s", delay: "1.8s" },
  { size: 6, right: 76, dx: "-10px", dur: "7s", delay: "5.6s" },
  { size: 8, right: 90, dx: "8px", dur: "8s", delay: "3s" },
  { size: 5, right: 104, dx: "-7px", dur: "6.8s", delay: "6.4s" },
  { size: 9, right: 118, dx: "11px", dur: "9s", delay: "4.2s" },
  { size: 7, right: 132, dx: "-9px", dur: "7.8s", delay: "2s" },
];

// Loqo adının üstündən süzülən qar dənələri: yavaşca fırlanıb enir və əriyir (yalnız CSS).
// Ata element `relative inline-block` olmalıdır (qar dənələri mətnin alt kənarına bağlanır).
export function BrandSnow() {
  return FLAKES.map((f, i) => (
    <Snowflake key={i} aria-hidden="true" size={f.size} strokeWidth={2.4} className={s.flake} style={{ right: f.right, "--dx": f.dx, animationDuration: f.dur, animationDelay: f.delay } as React.CSSProperties} />
  ));
}
