import type { LogPerson } from "@/types/workLogs";

// Eyni qrupun işləri bir açardır
export const jobKey = (id: number, groups: Map<number, string>) => groups.get(id) ?? `l${id}`;

// Qrup işi bir say olmaqla iş sayı
export const countJobs = (logs: { id: number }[], groups: Map<number, string>) =>
  new Set(logs.map((l) => jobKey(l.id, groups))).size;

// Ümumi siyahılarda qrup işi BİR sətirdir: üzvlərin adları birləşir ("Xəyyam + Fərhad"), şəkil birincinindir (admin `lib/jobs.ts` ilə eyni).
export function mergeGroupLogs<T extends { id: number; employees: LogPerson }>(logs: T[], groups: Map<number, string>): T[] {
  if (!groups.size) return logs;
  const out: T[] = [];
  const at = new Map<string, number>();
  for (const l of logs) {
    const g = groups.get(l.id);
    if (!g) { out.push(l); continue; }
    const i = at.get(g);
    if (i === undefined) { at.set(g, out.length); out.push(l); continue; }
    const first = out[i];
    const name = l.employees?.full_name;
    if (first.employees && name && !first.employees.full_name.split(" + ").includes(name)) {
      out[i] = { ...first, employees: { ...first.employees, full_name: `${first.employees.full_name} + ${name}` } };
    }
  }
  return out;
}
