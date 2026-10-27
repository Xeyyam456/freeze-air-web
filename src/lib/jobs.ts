import type { SupabaseClient } from "@supabase/supabase-js";

// Qrup tapşırığı (0071) hər üzvə ayrıca iş qeydi yaradır, amma bu BİR işdir: ümumi (şirkət, komanda) saylarda bir dəfə sayılır.
// Ustanın öz sayı dəyişmir (hər üzv öz işini görür). İş qeydi → qrup (tapşırığın `group_id`-si).
export async function fetchGroupMap(supabase: SupabaseClient, from: string, to?: string): Promise<Map<number, string>> {
  let q = supabase.from("tasks").select("work_log_id, group_id")
    .not("group_id", "is", null).not("work_log_id", "is", null).gte("task_date", from);
  if (to) q = q.lte("task_date", to);
  const { data } = await q.limit(5000);
  return new Map((data ?? []).map((t) => [t.work_log_id as number, t.group_id as string]));
}

// Eyni qrupun işləri bir açardır
export const jobKey = (id: number, groups: Map<number, string>) => groups.get(id) ?? `l${id}`;

// Qrup işi bir say olmaqla iş sayı
export const countJobs = (logs: { id: number }[], groups: Map<number, string>) =>
  new Set(logs.map((l) => jobKey(l.id, groups))).size;

export type FileCount = { act: number; photo: number; video: number };

// İş qeydlərinin faylları (akt, şəkil, video) siyahıda nişan üçün. Qrup işində fayl istənilən üzvün qeydinə yüklənə bilər:
// qrupun bütün qeydlərinin faylları toplanır və hər üzvün qeydinə eyni say verilir (işi açmadan görünsün). Admin `lib/jobs.ts` ilə eyni.
export async function fetchFileCounts(supabase: SupabaseClient, logIds: number[]): Promise<Map<number, FileCount>> {
  const out = new Map<number, FileCount>();
  if (!logIds.length) return out;
  const { data: own } = await supabase.from("tasks").select("work_log_id, group_id").in("work_log_id", logIds).not("group_id", "is", null);
  const groupOf = new Map<number, string>((own ?? []).map((t) => [t.work_log_id as number, t.group_id as string]));
  const groupIds = [...new Set(groupOf.values())];
  const members = groupIds.length
    ? ((await supabase.from("tasks").select("work_log_id, group_id").in("group_id", groupIds).not("work_log_id", "is", null)).data ?? [])
    : [];
  for (const m of members) groupOf.set(m.work_log_id as number, m.group_id as string);
  const allIds = [...new Set([...logIds, ...groupOf.keys()])];
  const { data: files } = await supabase.from("work_files").select("work_log_id, kind").in("work_log_id", allIds);
  const byKey = new Map<string, FileCount>();
  for (const f of (files ?? []) as { work_log_id: number; kind: string }[]) {
    const k = jobKey(f.work_log_id, groupOf);
    const c = byKey.get(k) ?? { act: 0, photo: 0, video: 0 };
    if (f.kind === "act" || f.kind === "photo" || f.kind === "video") c[f.kind] += 1;
    byKey.set(k, c);
  }
  for (const id of logIds) { const c = byKey.get(jobKey(id, groupOf)); if (c) out.set(id, c); }
  return out;
}

type Person ={ full_name: string; photo_url: string | null } | null;

// Ümumi siyahılarda qrup işi BİR sətirdir: üzvlərin adları birləşir ("Xəyyam + Fərhad"), şəkil birincinindir (admin `lib/jobs.ts` ilə eyni).
export function mergeGroupLogs<T extends { id: number; employees: Person }>(logs: T[], groups: Map<number, string>): T[] {
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
