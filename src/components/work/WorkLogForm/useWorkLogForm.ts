import { useEffect, useRef, useState } from "react";
import type { CompressedVideo } from "@/lib/video";
import { toast } from "@/lib/toast";
import { saveUsedMaterials } from "@/services/myWork/materials";
import { loadPlaces } from "@/services/myWork/places";
import { removeLogFiles, uploadLogFiles, upsertLog } from "@/services/myWork/saveLog";
import type { Place, WorkDraft, WorkLogFormProps } from "@/types/myWork";
import { fmtNum, readDraft, toNum, writeDraft } from "./draft";
import { useHeldMaterials } from "./useHeldMaterials";

// İş formunun vəziyyəti: qaralama, yer, material, fayllar (akt, şəkil, video), redaktədə təsdiq, yadda saxlama
export function useWorkLogForm({ employeeId, existing, onClose, onSaved }: WorkLogFormProps) {
  // Yeni işdə əvvəlki yarımçıq qaralama bərpa olunur (redaktədə qaralama yoxdur)
  const [draft] = useState<WorkDraft | null>(() => (existing ? null : readDraft(employeeId)));
  const [places, setPlaces] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place | null>(existing?.place ?? draft?.place ?? null);
  const formRef = useRef<HTMLFormElement>(null);
  const m = useHeldMaterials(employeeId, existing?.id ?? null, draft?.materials ?? {});
  const [act, setAct] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<CompressedVideo | null>(null); // seçiləndə dərhal 720p-yə sıxılır
  const [videoBusy, setVideoBusy] = useState(false); // sıxılma gedir
  const [removed, setRemoved] = useState<Set<number>>(new Set()); // silinməsi seçilmiş mövcud fayllar
  const [confirmData, setConfirmData] = useState<FormData | null>(null); // redaktədə təsdiq gözləyən forma
  const [pending, setPending] = useState(false);
  useEffect(() => { loadPlaces().then(setPlaces); }, []);
  const toggleRemove = (id: number) => setRemoved((s) => { const next = new Set(s); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  // Qaralamanı yenilə: mətn yazılanda (form onChange), yer və ya kod seçiləndə
  function saveDraft(next: Partial<WorkDraft> = {}) {
    if (existing || !formRef.current) return;
    const form = new FormData(formRef.current);
    const d: WorkDraft = { work_date: String(form.get("work_date") ?? ""), description: String(form.get("description") ?? ""), place, materials: m.usedRef.current, ...next };
    writeDraft(employeeId, d.description?.trim() || d.place || Object.values(d.materials ?? {}).some(Boolean) ? d : null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (videoBusy) return toast.error("Video hələ hazırlanır, bir az gözlə.");
    const form = new FormData(e.currentTarget);
    if (!place) return toast.error("İşin görüldüyü yeri seç.");
    if (!String(form.get("description") ?? "").trim()) return toast.error("Görülən işi yaz.");
    if (m.overused.length) return toast.error(`${m.overused[0].name}: üzərində cəmi ${fmtNum(m.overused[0].quantity)} ${m.overused[0].unit} var.`);
    // Redaktədə əvvəl "Məlumatların doğruluğunu təsdiq edirsinizmi?" soruşulur
    if (existing) setConfirmData(form);
    else save(form);
  }

  async function save(form: FormData) {
    if (!place) return;
    setPending(true);
    const res = await upsertLog({
      work_date: String(form.get("work_date")), store_id: place.storeId, company_id: place.companyId,
      place_text: place.custom, description: String(form.get("description") ?? "").trim(),
    }, employeeId, existing?.id);
    if ("error" in res) { setPending(false); return toast.error(res.error); }
    // Silinməsi seçilmiş fayllar; yeni akt seçilibsə köhnə akt da əvəz olunur
    const toRemove = (existing?.files ?? []).filter((f) => removed.has(f.id) || (act && f.kind === "act"));
    if (toRemove.length) await removeLogFiles(toRemove);
    const failed = await uploadLogFiles(res.logId, [...(act ? [{ file: act, kind: "act" }] : []), ...photos.map((f) => ({ file: f, kind: "photo" })),
      ...(video ? [{ file: video.file, kind: "video" }] : [])]);
    const rows = m.held.map((h) => ({ tool_id: h.toolId, amount: toNum(m.used[h.toolId]) })).filter((r) => r.amount > 0);
    if (!(await saveUsedMaterials(res.logId, rows, !!existing))) failed.push("material sərfi");
    setPending(false);
    if (failed.length) {
      // İş yazılıb, amma bəzi fayllar yüklənməyib: istifadəçiyə deyirik, pəncərəni bağlamırıq
      onSaved();
      return toast.error(`İş saxlanıldı, amma bu fayllar yüklənmədi: ${failed.join(", ")}. Şəkil və PDF 10 MB-dan, video 50 MB-dan böyük olmamalıdır.`);
    }
    if (!existing) writeDraft(employeeId, null);
    onSaved();
    toast.success(existing ? "İş yeniləndi" : "İş əlavə edildi");
    onClose();
  }

  return {
    draft, places, place, setPlace, formRef, held: m.held, used: m.used, use: m.use, act, setAct, photos, setPhotos, video, setVideo, setVideoBusy, removed, toggleRemove,
    confirmData, setConfirmData, pending, saveDraft, onSubmit, save,
    hasAct: (existing?.files ?? []).filter((f) => !removed.has(f.id)).some((f) => f.kind === "act"),
  };
}
