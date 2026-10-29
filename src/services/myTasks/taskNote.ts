import { createClient } from "@/lib/supabase/client";
import type { NewWorkFile, SavedFile } from "@/types/myTasks";

function ext(file: File) {
  return file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
}

// İş qeydinin mövcud faylları (şəkillər imzalı linklə, bucket gizlidir)
export async function fetchLogFiles(logId: number): Promise<SavedFile[]> {
  const supabase = createClient();
  const { data } = await supabase.from("work_files").select("id, kind, path").eq("work_log_id", logId).order("id");
  const rows = data ?? [];
  const { data: signed } = await supabase.storage.from("work").createSignedUrls(rows.map((r) => r.path), 3600);
  return rows.map((r, i) => ({ ...r, url: signed?.[i]?.signedUrl }));
}

// Təmir yazısı (RPC task_set_note): iş qeydinin id-si və ya xəta
export async function saveTaskNote(taskId: number, note: string): Promise<{ error: string } | { logId: number }> {
  const { data: logId, error } = await createClient().rpc("task_set_note", { p_task_id: taskId, p_note: note });
  return error || !logId ? { error: error?.message ?? "Yadda saxlanmadı." } : { logId };
}

// Faylları sil (storage + qeyd)
export async function removeWorkFiles(files: SavedFile[]) {
  const supabase = createClient();
  await supabase.storage.from("work").remove(files.map((f) => f.path));
  await supabase.from("work_files").delete().in("id", files.map((f) => f.id));
}

// Yeni fayllar: work/<iş id>/<təsadüfi ad>; yüklənməyənlərin adları qaytarılır
export async function uploadWorkFiles(logId: number, files: NewWorkFile[]) {
  const supabase = createClient();
  const failed: string[] = [];
  for (const { file, kind } of files) {
    const path = `${logId}/${crypto.randomUUID()}.${ext(file)}`;
    const { error: upError } = await supabase.storage.from("work").upload(path, file, { contentType: file.type });
    if (upError) {
      failed.push(file.name);
      continue;
    }
    await supabase.from("work_files").insert({ work_log_id: logId, kind, path });
  }
  return failed;
}
