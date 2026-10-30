import type { MyLeaveRow } from "@/types/leaves";

// Aktiv: gözləyən və ya hələ bitməmiş təsdiqli icazə; qalanı tarixçə
export function splitLeaves(all: MyLeaveRow[], today: string) {
  const active = all.filter((l) => l.status === "pending" || (l.status === "approved" && l.date_to >= today))
    .sort((a, b) => a.date_from.localeCompare(b.date_from));
  return { active, past: all.filter((l) => !active.includes(l)) };
}
