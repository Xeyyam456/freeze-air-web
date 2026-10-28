import type { Held } from "@/types/myTools/Held";
import type { Person } from "@/types/myTools/Person";

export function groupPeople(all: Held[], me: number) {
  const by = new Map<number, Person>();
  for (const h of all) {
    const p = by.get(h.employee_id) ?? { id: h.employee_id, name: h.employees?.full_name ?? "—", photo: h.employees?.photo_url ?? null, items: [] };
    p.items.push(h);
    by.set(h.employee_id, p);
  }
  return [...by.values()].sort((a, b) => (a.id === me ? -1 : b.id === me ? 1 : a.name.localeCompare(b.name, "az")));
}
export const counts = (p: Person) => ({
  tools: p.items.filter((h) => h.tools?.kind !== "material").reduce((n, h) => n + h.quantity, 0),
  mats: p.items.filter((h) => h.tools?.kind === "material").length,
});
