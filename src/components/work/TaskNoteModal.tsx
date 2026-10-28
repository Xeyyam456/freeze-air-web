"use client";

import { useEffect, useState } from "react";
import { FileText, ImagePlus, Video, X } from "lucide-react";
import { Buttons, Field } from "@/components/forms";
import { Modal } from "@/shared/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { CompressedVideo } from "@/lib/video";
import { VideoPicker, VideoSummary } from "./VideoPicker";

type SavedFile = { id: number; kind: string; path: string; url?: string | null };

function ext(file: File) {
  return file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
}

// Görülmüş tapşırığın altına təmir barədə yazı və akt/şəkil əlavə etmək, əvvəl qoyulanları dəyişmək və ya silmək.
// İş artıq "Görülən işlər"dədir (✓ basılanda avtomatik düşüb): yazı həmin işin təsvirini yeniləyir (RPC task_set_note; yazı
// təmizlənsə təsvir tapşırığın səbəbinə qayıdır), fayllar həmin işə aiddir. Silmək "Yadda saxla" basanda olur (iş formundakı kimi).
export function TaskNoteModal({ task, onClose, onSaved }: {
  task: { id: number; logId: number | null; reason: string; note: string | null; place: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saved, setSaved] = useState<SavedFile[] | null>(task.logId ? null : []);
  const [removed, setRemoved] = useState<Set<number>>(new Set()); // silinməsi seçilmiş mövcud fayllar
  const [act, setAct] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<CompressedVideo | null>(null);
  const [videoBusy, setVideoBusy] = useState(false);
  const [pending, setPending] = useState(false);

  // Mövcud fayllar (şəkillər imzalı linklə, bucket gizlidir)
  useEffect(() => {
    if (!task.logId) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("work_files").select("id, kind, path").eq("work_log_id", task.logId!).order("id");
      const rows = data ?? [];
      const { data: signed } = await supabase.storage.from("work").createSignedUrls(rows.map((r) => r.path), 3600);
      if (!cancelled) setSaved(rows.map((r, i) => ({ ...r, url: signed?.[i]?.signedUrl })));
    })();
    return () => { cancelled = true; };
  }, [task.logId]);

  const kept = (saved ?? []).filter((f) => !removed.has(f.id));
  const toggleRemove = (id: number) =>
    setRemoved((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (videoBusy) return toast.error("Video hələ hazırlanır, bir az gözlə.");
    const note = String(new FormData(e.currentTarget).get("note") ?? "");
    setPending(true);
    const supabase = createClient();

    const { data: logId, error } = await supabase.rpc("task_set_note", { p_task_id: task.id, p_note: note });
    if (error || !logId) {
      setPending(false);
      return toast.error(error?.message ?? "Yadda saxlanmadı.");
    }

    // Silinməsi seçilmiş fayllar; yeni akt seçilibsə köhnə akt da əvəz olunur
    const toRemove = (saved ?? []).filter((f) => removed.has(f.id) || (act && f.kind === "act"));
    if (toRemove.length) {
      await supabase.storage.from("work").remove(toRemove.map((f) => f.path));
      await supabase.from("work_files").delete().in("id", toRemove.map((f) => f.id));
    }

    // Yeni fayllar: work/<iş id>/<təsadüfi ad>
    const files = [...(act ? [{ file: act, kind: "act" }] : []), ...photos.map((f) => ({ file: f, kind: "photo" })),
      ...(video ? [{ file: video.file, kind: "video" }] : [])];
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
      return toast.error(`Yazı saxlanıldı, amma bu fayllar yüklənmədi: ${failed.join(", ")}. Şəkil və PDF 10 MB-dan, video 50 MB-dan böyük olmamalıdır.`);
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

        {/* Mövcud fayllar: × ilə silinməyə işarələnir, saxlayanda silinir */}
        {saved === null ? (
          <p className="muted text-sm">Fayllar yüklənir...</p>
        ) : saved.length > 0 && (
          <div>
            <span className="label">Mövcud fayllar</span>
            <div className="flex flex-wrap gap-2">
              {saved.map((f) => {
                const gone = removed.has(f.id);
                return (
                  <div key={f.id} className={`relative ${gone ? "opacity-40" : ""}`}>
                    {f.kind === "act" ? (
                      <span className="flex h-14 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold">
                        <FileText size={16} className="text-primary" /> Akt
                      </span>
                    ) : f.kind === "video" ? (
                      <span className="flex h-14 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold">
                        <Video size={16} className="text-primary" /> Video
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- imzalı storage linki
                      <img src={f.url ?? undefined} alt="İşin şəkli" className="h-14 w-14 rounded-lg border border-line object-cover" />
                    )}
                    <button type="button" onClick={() => toggleRemove(f.id)}
                      className={`absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full text-white shadow ${gone ? "bg-muted" : "bg-danger"}`}
                      title={gone ? "Silməni ləğv et" : "Sil"} aria-label={gone ? "Silməni ləğv et" : "Faylı sil"}>
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
            {removed.size > 0 && <p className="mt-1 text-xs text-danger">{removed.size} fayl yadda saxlayanda silinəcək.</p>}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 max-sm:gap-2 max-[400px]:grid-cols-2">
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-3 py-3 text-center hover:border-primary">
            <FileText size={18} className="text-primary" />
            <span className="text-sm font-semibold">Akt</span>
            <span className="muted w-full truncate text-xs">{act ? act.name : kept.some((f) => f.kind === "act") ? "yenisi köhnəni əvəz edir" : "şəkil və ya PDF"}</span>
            <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setAct(e.target.files?.[0] ?? null)} />
          </label>
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-3 py-3 text-center hover:border-primary">
            <ImagePlus size={18} className="text-primary" />
            <span className="text-sm font-semibold">Şəkillər</span>
            <span className="muted text-xs">{photos.length ? `${photos.length} yeni şəkil seçildi` : "bir neçə şəkil əlavə et"}</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} />
          </label>
          <VideoPicker value={video} onChange={setVideo} onBusy={setVideoBusy} className="max-[400px]:col-span-2" />
        </div>
        <VideoSummary value={video} onRemove={() => setVideo(null)} />

        <Buttons pending={pending} label="Yadda saxla" onCancel={onClose} />
      </form>
    </Modal>
  );
}
