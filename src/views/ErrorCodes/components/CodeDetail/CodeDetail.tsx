import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CodeDetailProps } from "@/types/errorCodes";
import { isNoInfo } from "../../utils/isNoInfo";
import s from "./CodeDetail.module.css";

// Seçilmiş kodun izahı: açıqlama, edilecək iş, eyni kod digər modellərdə, ‹ › qonşu kodlar
export function CodeDetail({ code, modelName, twins, prev, next, onSelect }: CodeDetailProps) {
  if (!code) {
    return <p className={s.hint}>Kodu yaz və ya xəritədən seç. Açıqlama burada görünəcək.</p>;
  }
  const noInfo = isNoInfo(code);
  return (
    <div className={s.root}>
      <div>
        <p className={s.model}>{modelName}, kod {code.code}</p>
        <h2 className={`${s.title} ${noInfo ? s.muted : ""}`}>{noInfo ? "Kitabçada bu kodun izahı yoxdur" : code.title}</h2>
      </div>

      <section className={s.work}>
        <h3>Edilecək iş</h3>
        {code.solution
          ? <p className="whitespace-pre-line">{code.solution}</p>
          : <p className={s.empty}>Hələ yazılmayıb. Rəhbərlik admin paneldən əlavə edə bilər.</p>}
      </section>

      {twins.length > 0 && (
        <section className={s.twins}>
          <h3>{code.code} digər modellərdə</h3>
          <ul>
            {twins.map((t) => (
              <li key={t.code.id}>
                <button type="button" onClick={() => onSelect(t.code)}>
                  <b>{t.modelName}</b>
                  <span>{isNoInfo(t.code) ? "İzah yoxdur" : t.code.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className={s.steps} aria-label="Qonşu kodlar">
        <button type="button" disabled={!prev} onClick={() => prev && onSelect(prev)} aria-label="Əvvəlki kod">
          <ChevronLeft size={16} /> {prev?.code ?? "—"}
        </button>
        <button type="button" disabled={!next} onClick={() => next && onSelect(next)} aria-label="Növbəti kod">
          {next?.code ?? "—"} <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
