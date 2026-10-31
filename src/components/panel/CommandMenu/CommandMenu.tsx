"use client";

import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { useEscapeLayer } from "@/shared/hooks/useEscapeLayer";
import type { CommandMenuProps } from "@/types/panel";
import { CommandRow } from "./CommandRow";
import { useCommandMenu } from "./useCommandMenu";

// Ctrl+K: səhifələr, tez əməllər (iş əlavə et, icazə istə) və bazadan şirkət / market / mağaza axtarışı.
// ↑ ↓ ilə seçilir, Enter açır, Esc bağlayır.
export function CommandMenu(props: CommandMenuProps) {
  const { query, onQuery, onKeyDown, items, current, setActive, listRef } = useCommandMenu(props);
  useEscapeLayer(props.onClose);

  return createPortal(
    <div className="cmdk-backdrop" onMouseDown={(e) => e.target === e.currentTarget && props.onClose()}>
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Axtarış">
        <div className="cmdk-input">
          <Search size={20} className="shrink-0 text-muted" />
          <input autoFocus value={query} onKeyDown={onKeyDown} placeholder="Səhifə, şirkət, mağaza kodu…" onChange={(e) => onQuery(e.target.value)} />
          <kbd>Esc</kbd>
        </div>
        <div ref={listRef} className="cmdk-list nice-scroll" role="listbox" aria-label="Nəticələr">
          {items.length === 0 && <p className="muted px-4 py-10 text-center text-sm">Heç nə tapılmadı</p>}
          {items.map((item, i) => {
            const head = i === 0 || items[i - 1].group !== item.group ? item.group : null;
            return <CommandRow key={item.key} item={item} index={i} current={i === current} head={head} onHover={setActive} />;
          })}
        </div>
        <div className="cmdk-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> seç</span>
          <span><kbd>Enter</kbd> aç</span>
          <span className="ml-auto"><kbd>Ctrl</kbd><kbd>K</kbd> hər yerdən</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
