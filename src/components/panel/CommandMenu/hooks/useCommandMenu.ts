import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchPlaces } from "@/services/search/searchPlaces";
import type { CommandMenuProps, Found } from "@/types/panel";
import { emitPanel, PANEL_EVENTS } from "../../nav";
import { buildItems } from "../utils/buildItems";

// Ctrl+K: yazı → bazada axtarış (2 hərfdən, fasilə ilə), ↑ ↓ seçir, Enter açır
export function useCommandMenu({ showDepot, showFuel, onClose }: CommandMenuProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const go = (href: string) => () => {
    onClose();
    router.push(href);
  };
  const act = (name: (typeof PANEL_EVENTS)[keyof typeof PANEL_EVENTS]) => () => {
    onClose();
    emitPanel(name);
  };

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const timer = setTimeout(async () => {
      setFound(await searchPlaces(q));
      setActive(0);
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  // go/act hər renderdə yenidir, amma yalnız onClose və router-dən asılıdır
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => buildItems(query, found, showDepot, showFuel, { go, act }), [query, found, showDepot, showFuel]);
  const current = Math.min(active, Math.max(items.length - 1, 0));

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (current + (e.key === "ArrowDown" ? 1 : -1) + items.length) % Math.max(items.length, 1);
      setActive(next);
      listRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[current]?.run();
    }
  }

  function onQuery(value: string) {
    setQuery(value);
    setActive(0);
    if (value.trim().length < 2) setFound(null);
  }

  return { query, onQuery, onKeyDown, items, current, setActive, listRef };
}
