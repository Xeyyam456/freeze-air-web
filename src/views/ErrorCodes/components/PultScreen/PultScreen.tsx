"use client";

import { useEffect, useRef } from "react";
import type { PultScreenProps } from "@/types/errorCodes";
import { SegmentDisplay } from "../SegmentDisplay";
import s from "./PultScreen.module.css";

// Pultun ekranı + yazı sahəsi: usta pultda gördüyü kodu yazır, ekranda həmin kod yanır. "/" düyməsi sahəyə keçir.
export function PultScreen({ text, query, modelName, onQuery }: PultScreenProps) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={s.root}>
      <div className={s.glass} onClick={() => input.current?.focus()}>
        <span className={s.model}>{modelName}</span>
        <SegmentDisplay text={text} />
      </div>
      <label className={s.field}>
        <span className="sr-only">Xəta kodu və ya söz</span>
        <input
          ref={input}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Kodu yaz: U4, ya da söz: termistor"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        {query ? (
          <button type="button" className={s.clear} onClick={() => { onQuery(""); input.current?.focus(); }}>Təmizlə</button>
        ) : (
          <kbd className={s.kbd}>/</kbd>
        )}
      </label>
    </div>
  );
}
