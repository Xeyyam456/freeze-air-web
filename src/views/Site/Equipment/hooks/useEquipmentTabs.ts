import { useRef, useState } from "react";

// Avadanlıq vitrininin vəziyyəti: seçilmiş növ; ox düymələri ilə tablar arasında keçid (WAI-ARIA tabs nümunəsi)
export function useEquipmentTabs(count: number) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === "ArrowDown" ? i + 1 : e.key === "ArrowUp" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const n = (next + count) % count;
    setActive(n);
    tabs.current[n]?.focus();
  };

  return { active, setActive, tabs, onKey };
}
