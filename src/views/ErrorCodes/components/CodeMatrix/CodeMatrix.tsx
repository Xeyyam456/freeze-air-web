import type { CodeMatrixProps } from "@/types/errorCodes";
import { compareCodes } from "../../utils/compareCodes";
import { isNoInfo } from "../../utils/isNoInfo";
import s from "./CodeMatrix.module.css";

const sortChars = (set: Set<string>) => [...set].sort(compareCodes);

// Kod xəritəsi: sətir = kodun 1-ci simvolu, sütun = 2-ci simvol (servis kitabçasındakı cədvəl kimi).
// Axtarışda uyğun xanalar işıqlanır, qalanları solur; boş xana: bu modeldə belə kod yoxdur.
export function CodeMatrix({ codes, selectedId, matches, onSelect }: CodeMatrixProps) {
  const rows = sortChars(new Set(codes.map((c) => c.code[0])));
  const cols = sortChars(new Set(codes.map((c) => c.code[1])));
  const byCode = new Map(codes.map((c) => [c.code, c]));

  return (
    <div className={s.root} style={{ "--cols": cols.length } as React.CSSProperties} role="grid" aria-label="Kod xəritəsi">
      <span aria-hidden="true" />
      {cols.map((col) => <span key={col} className={s.head} aria-hidden="true">{col}</span>)}
      {rows.map((row) => (
        <div key={row} role="row" className={s.row}>
          <span className={s.head} role="rowheader">{row}</span>
          {cols.map((col) => {
            const c = byCode.get(row + col);
            if (!c) return <span key={col} className={s.void} role="gridcell" aria-label={`${row}${col}: bu modeldə yoxdur`} />;
            const cls = [
              s.cell,
              isNoInfo(c) && s.noInfo,
              matches && (matches.has(c.id) ? s.match : s.dim),
              c.id === selectedId && s.selected,
            ].filter(Boolean).join(" ");
            return (
              <button key={col} type="button" role="gridcell" className={cls} title={c.title} aria-selected={c.id === selectedId} onClick={() => onSelect(c)}>
                {c.code}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
