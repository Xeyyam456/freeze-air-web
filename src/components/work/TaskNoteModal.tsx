"use client";

import { useState } from "react";
import { FileText, ImagePlus } from "lucide-react";
import { Buttons, Field } from "@/components/forms";
import { Modal } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

function ext(file: File) {
  return file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
}

// Görülmüş tapşırığın altına təmir barədə yazı və akt/şəkil əlavə etmək. İş artıq "Görülən işlər"dədir (✓ basılanda avtomatik düşüb):
// yazı həmin işin təsvirini yeniləyir (RPC task_set_note), fayllar həmin işə yüklənir.
export function TaskNoteModal({ task, onClose, onSaved }: {
  task: { id: number; reason: string; note: string | null; place: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [act, setAct] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const note = String(new FormData(e.currentTarget).get("note") ?? "");
    setPending(true);
    const supabase = createClient();

    const { data: logId, error } = await supabase.rpc("task_set_note", { p_task_id: task.id, p_note: note });
    if (error || !logId) {
      setPending(false);
      return toast.error(error?.message ?? "Yadda saxlanmadı.");
    }

    // Yeni akt əvvəlki aktı əvəz edir; şəkillər əlavə olunur: work/<iş id>/<təsadüfi ad>
    const files = [...(act ? [{ file: act, kind: "act" }] : []), ...photos.map((f) => ({ file: f, kind: "photo" }))];
    if (act) {
      const { data: oldActs } = await supabase.from("work_files").select("id, path").eq("work_log_id", logId).eq("kind", "act");
      if (oldActs?.length) {
        await supabase.storage.from("work").remove(oldActs.map((f) => f.path));
        await supabase.from("work_files").delete().in("id", oldActs.map((f) => f.id));
      }
    }
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

    setPending(false);
    onSaved();
    if (failed.length) {
      return toast.error(`Yazı saxlanıldı, amma bu fayllar yüklənmədi: ${failed.join(", ")}. Fayl 10 MB-dan böyük olmamalı, şəkil və ya PDF olmalıdır.`);
    }
    toast.success("Təmir barədə məlumat saxlanıldı");
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="task-note-title" className="!max-w-lg">
      <div className="mb-4">
        <h2 id="task-note-title" className="text-lg font-bold">Təmir barədə</h2>
        <p className="muted text-sm"><span className="font-semibold text-primary">{task.place}</span> — {task.reason}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nə edildi?">
          <textarea name="note" rows={4} defaultValue={task.note ?? ""} autoFocus className="field resize-none"
            placeholder="Məs. kompressor klapanı dəyişdirildi, qaz sızması aradan qalxdı, sistem yoxlanıldı" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-3 py-3 text-center hover:border-primary">
            <FileText size={18} className="text-primary" />
            <span className="text-sm font-semibold">Akt</span>
            <span className="muted w-full truncate text-xs">{act ? act.name : "şəkil və ya PDF"}</span>
            <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setAct(e.target.files?.[0] ?? null)} />
          </label>
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-3 py-3 text-center hover:border-primary">
            <ImagePlus size={18} className="text-primary" />
            <span className="text-sm font-semibold">Şəkillər</span>
            <span className="muted text-xs">{photos.length ? `${photos.length} şəkil seçildi` : "bir neçə şəkil"}</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} />
          </label>
        </div>

        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </form>
    </Modal>
  );
}
