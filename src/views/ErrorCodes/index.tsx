"use client";

import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { ErrorCode } from "@/types/errorCodes";
import { CodeDetail } from "./components/CodeDetail";
import { CodeList } from "./components/CodeList";
import { CodeMatrix } from "./components/CodeMatrix";
import { ModelTabs } from "./components/ModelTabs";
import { PultScreen } from "./components/PultScreen";
import { SegmentDisplay } from "./components/SegmentDisplay";
import { useBackClose } from "./hooks/useBackClose";
import { useErrorCodes } from "./hooks/useErrorCodes";
import { useWide } from "./hooks/useWide";
import s from "./styles/ErrorCodes.module.css";

// Xəta kodları (usta paneli, yalnız baxış): solda kod xəritəsi, sağda pult — kodu yaz, ekranda yanır, izahı altında.
// Dar ekranda pult yuxarıda qalır; siyahıdan seçilən kod pəncərədə açılır.
export function ErrorCodesView() {
  const st = useErrorCodes();
  const wide = useWide();
  const [sheet, setSheet] = useState(false);
  const closeSheet = useBackClose(sheet && !wide, useCallback(() => setSheet(false), []));

  if (!st) return <div className={s.loading} aria-busy="true" />;
  if (st.models.length === 0) return <p className={s.none}>Hələ xəta kodu əlavə olunmayıb. Kodları admin paneldən rəhbərlik əlavə edir.</p>;

  const pick = (c: ErrorCode) => {
    st.select(c);
    if (!wide) setSheet(true);
  };
  const detail = <CodeDetail code={st.selected} modelName={st.modelName} twins={st.twins} prev={st.prev} next={st.next} onSelect={st.select} />;
  const visible = st.matches ? st.codes.filter((c) => st.matches?.has(c.id)) : st.codes;

  return (
    <div className={s.root}>
      <div className={s.main}>
        <div className={s.bar}>
          <ModelTabs models={st.models} counts={st.counts} value={st.modelId} onChange={st.setModelId} />
          <p className={s.legend} aria-hidden="true">
            <i className={s.keyInfo} /> izahı var <i className={s.keyNone} /> izahı yoxdur <i className={s.keyVoid} /> bu modeldə yoxdur
          </p>
        </div>

        <div className="max-sm:hidden">
          <CodeMatrix codes={st.codes} selectedId={st.selected?.id ?? null} matches={st.matches} onSelect={pick} />
          {st.results && (
            <div className={s.results}>
              <h3>{st.results.length} uyğun kod</h3>
              <CodeList codes={st.results} selectedId={st.selected?.id ?? null} onSelect={pick} />
            </div>
          )}
        </div>
        <div className="sm:hidden">
          <CodeList codes={visible} selectedId={st.selected?.id ?? null} grouped onSelect={pick} />
        </div>
      </div>

      <aside className={s.pult} aria-label="Pult">
        <PultScreen text={st.display} query={st.query} modelName={st.modelName} onQuery={st.setQuery} />
        {(wide || st.selected) && !sheet && <div className={s.detail}>{detail}</div>}
      </aside>

      {sheet && !wide && st.selected && (
        <Modal onClose={closeSheet} labelledBy="code-sheet" className={s.sheet}>
          <button type="button" className={s.sheetClose} onClick={closeSheet} aria-label="Bağla"><X size={18} /></button>
          <div id="code-sheet" className={s.sheetScreen}>
            <SegmentDisplay text={st.selected.code} />
          </div>
          {detail}
        </Modal>
      )}
    </div>
  );
}
