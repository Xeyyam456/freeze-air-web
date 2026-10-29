import { useEffect, useState } from "react";
import type { CompressedVideo } from "@/lib/video";
import { toast } from "@/lib/toast";
import { fetchLogFiles, removeWorkFiles, saveTaskNote, uploadWorkFiles } from "@/services/myTasks/taskNote";
import type { SavedFile, TaskNoteModalProps } from "@/types/myTasks";

// Təmir qeydi pəncərəsinin vəziyyəti: mövcud fayllar (silinməyə işarələnir), yeni akt/şəkil/video, yadda saxlama
export function useTaskNote({ task, onClose, onSaved }: TaskNoteModalProps) {
  const [saved, setSaved] = useState<SavedFile[] | null>(task.logId ? null : []);
  const [removed, setRemoved] = useState<Set<number>>(new Set()); // silinməsi seçilmiş mövcud fayllar
  const [act, setAct] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<CompressedVideo | null>(null);
  const [videoBusy, setVideoBusy] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!task.logId) return;
    let cancelled = false;
    fetchLogFiles(task.logId).then((rows) => { if (!cancelled) setSaved(rows); });
    return () => { cancelled = true; };
  }, [task.logId]);

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
    const res = await saveTaskNote(task.id, note);
    if ("error" in res) {
      setPending(false);
      return toast.error(res.error);
    }
    // Silinməsi seçilmiş fayllar; yeni akt seçilibsə köhnə akt da əvəz olunur
    const toRemove = (saved ?? []).filter((f) => removed.has(f.id) || (act && f.kind === "act"));
    if (toRemove.length) await removeWorkFiles(toRemove);
    const failed = await uploadWorkFiles(res.logId, [...(act ? [{ file: act, kind: "act" }] : []), ...photos.map((f) => ({ file: f, kind: "photo" })),
      ...(video ? [{ file: video.file, kind: "video" }] : [])]);
    setPending(false);
    onSaved();
    if (failed.length) {
      return toast.error(`Yazı saxlanıldı, amma bu fayllar yüklənmədi: ${failed.join(", ")}. Şəkil və PDF 10 MB-dan, video 50 MB-dan böyük olmamalıdır.`);
    }
    toast.success("Təmir barədə məlumat saxlanıldı");
    onClose();
  }

  return {
    saved, removed, toggleRemove, act, setAct, photos, setPhotos, video, setVideo, setVideoBusy, pending, onSubmit,
    hasAct: (saved ?? []).filter((f) => !removed.has(f.id)).some((f) => f.kind === "act"),
  };
}
