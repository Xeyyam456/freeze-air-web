import { createClient } from "@/lib/supabase/client";
import type { FileCount } from "@/lib/jobs";

// Günün bütün tapşırıqları və aktiv ustalar (rəhbərlik yox)
export async function fetchMyTasks(day: string) {
  const supabase = createClient();
  const [tasks, employees] = await Promise.all([
    supabase.from("tasks")
      .select("id, employee_id, group_id, reason, done, note, work_log_id, place_text, cancelled_at, reassigned_to, stores(name, code, companies(name)), companies(name), work_logs(description, work_files(id, kind))")
      .eq("task_date", day).order("created_at").then((r) => r.data ?? []),
    supabase.from("employees").select("id, full_name, photo_url").eq("is_management", false).eq("is_active", true).order("full_name").then((r) => r.data ?? []),
  ]);
  // Geri alınıb başqasına verilənlər: yeni tapşırıq kimdədir ("Geri alınıb → Ad"; admin paneldəki ilə eyni)
  const nextIds = tasks.flatMap((t) => (t.reassigned_to ? [t.reassigned_to] : []));
  const nextName = new Map<number, string>();
  if (nextIds.length) {
    const { data } = await supabase.from("tasks").select("id, employees(full_name)").in("id", nextIds);
    for (const n of data ?? []) if (n.employees) nextName.set(n.id, n.employees.full_name);
  }
  // Fayllar qrup üzrə: video/şəkil istənilən üzvün iş qeydinə yüklənə bilər, hər üzvün kartında görünsün
  const filesBy = new Map<string, FileCount>();
  const fkey = (t: (typeof tasks)[number]) => t.group_id ?? `t${t.id}`;
  for (const t of tasks) {
    const c = filesBy.get(fkey(t)) ?? { act: 0, photo: 0, video: 0 };
    for (const f of t.work_logs?.work_files ?? []) if (f.kind === "act" || f.kind === "photo" || f.kind === "video") c[f.kind] += 1;
    filesBy.set(fkey(t), c);
  }
  return {
    tasks: tasks.map((t) => ({ ...t, files: filesBy.get(fkey(t))!, nextName: t.reassigned_to ? nextName.get(t.reassigned_to) : undefined })),
    employees,
  };
}
