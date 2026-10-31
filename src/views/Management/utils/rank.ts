import type { Employee } from "@/types/employees";

// Vəzifə sırası: müdir ən üstdə, sonra servis müdirləri, sonra qalanlar (maliyyəçi və s.)
export function rank(position: string | null) {
  const p = (position ?? "").toLocaleLowerCase("az");
  if (p === "müdir") return 0;
  if (p.includes("müdir")) return 1;
  return 2;
}

// Sıra: vəzifəyə görə, sonra ada görə
export const sortManagers = (managers: Employee[]) =>
  [...managers].sort((a, b) => rank(a.position) - rank(b.position) || a.full_name.localeCompare(b.full_name, "az"));
