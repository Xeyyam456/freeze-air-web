import { MapPin, Trophy } from "lucide-react";
import type { PlacesCardProps } from "@/types/panelDash";
import { DashCard } from "../DashCard";
import s from "./PlacesCard.module.css";

// Ən çox işlənən yerlər (seçilmiş ay, top 5): üfüqi sütunlar ardıcıl dolur, birinci yer vurğulanır
export function PlacesCard({ top, loaded, className = "" }: PlacesCardProps) {
  const max = top[0]?.n ?? 1;
  return (
    <DashCard tone="orange" className={className} title={<><Trophy size={17} className={s.icon} /> Ən çox işlənən yerlər</>} subtitle="Seçilmiş ay üzrə">
      {!loaded ? <p className={s.empty}>Yüklənir...</p> : top.length === 0 ? <p className={s.empty}>Bu ayda iş qeydi yoxdur.</p> : (
        <ol className={s.list}>
          {top.map((p, i) => (
            <li key={p.label} style={{ "--i": i } as React.CSSProperties}>
              <div className={s.row}>
                <span className={`${s.rank} ${i === 0 ? s.first : ""}`}>{i + 1}</span>
                <span className={s.name} title={p.label}><MapPin size={13} /> {p.label}</span>
                <b>{p.n}<small> iş</small></b>
              </div>
              <span className={s.track}><span style={{ width: `${(p.n / max) * 100}%` }} /></span>
            </li>
          ))}
        </ol>
      )}
    </DashCard>
  );
}
