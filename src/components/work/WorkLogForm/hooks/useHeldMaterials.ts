import { useEffect, useRef, useState } from "react";
import { fetchHeldMaterials } from "@/services/myWork/materials";
import type { HeldMaterial } from "@/types/myWork";
import { fmtNum, toNum } from "../utils/draft";

// Ustanın üzərindəki materiallar və bu işdə işlədilən miqdar (mətn); redaktədə əvvəl yazılan sərf doldurulur
export function useHeldMaterials(employeeId: number, logId: number | null, initial: Record<number, string>) {
  const [held, setHeld] = useState<HeldMaterial[]>([]);
  const [used, setUsed] = useState<Record<number, string>>(initial); // material id → işlədilən miqdar (mətn)
  const usedRef = useRef(used); // qaralama üçün son dəyər (formun onChange-i input-dan sonra köhnə state ilə gəlir)

  useEffect(() => {
    let cancelled = false;
    fetchHeldMaterials(employeeId, logId).then(({ held: h, prev }) => {
      if (cancelled) return;
      setHeld(h);
      if (prev.length) {
        usedRef.current = Object.fromEntries(prev.map((m) => [m.tool_id, fmtNum(m.amount)]));
        setUsed(usedRef.current);
      }
    });
    return () => { cancelled = true; };
  }, [employeeId, logId]);

  const use = (toolId: number, value: string) => {
    usedRef.current = { ...usedRef.current, [toolId]: value };
    setUsed(usedRef.current);
  };
  return { held, used, usedRef, use, overused: held.filter((m) => toNum(used[m.toolId]) > m.quantity) };
}
