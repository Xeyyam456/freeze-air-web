import { useState } from "react";
import type { Kind } from "@/types/depot";
import type { Mine } from "@/types/myTools";

// Alətlərim səhifəsinin vəziyyəti: açıq pəncərələr, tab, axtarış, seçilənlər (toplu qaytarma)
export function useMyToolsState() {
  const [returning, setReturning] = useState<Mine[] | null>(null);
  const [asking, setAsking] = useState(false);
  const [tab, setTab] = useState<Kind>("tool");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const toggle = (id: number) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  return { returning, setReturning, asking, setAsking, tab, setTab, query, setQuery, selected, setSelected, toggle };
}
