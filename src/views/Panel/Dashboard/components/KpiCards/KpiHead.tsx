import type { KpiHeadProps } from "@/types/panelDash";
import s from "./KpiCards.module.css";

// Göstərici kartının yuxarısı: solda rəngli ikon plitəsi (kartın tonunda), sağda nişan (faiz, fərq)
export function KpiHead({ icon: Icon, badge }: KpiHeadProps) {
  return (
    <div className={s.head}>
      <span className={s.tile}><Icon size={19} strokeWidth={2.1} /></span>
      {badge}
    </div>
  );
}
