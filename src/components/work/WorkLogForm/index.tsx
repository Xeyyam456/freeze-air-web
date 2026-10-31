"use client";

import { X } from "lucide-react";
import { DatePicker } from "@/shared/components/DatePicker";
import { Buttons } from "@/components/forms";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Modal } from "@/shared/components/Modal";
import type { WorkLogFormProps } from "@/types/myWork";
import { PlacePicker } from "../PlacePicker";
import { VideoSummary } from "../VideoPicker";
import { DraftNotice } from "./components/DraftNotice";
import { today, writeDraft } from "./utils/draft";
import { ExistingFilesEditor } from "./components/ExistingFilesEditor";
import { MaterialsUsed } from "./components/MaterialsUsed";
import { NewWorkFiles } from "./components/NewWorkFiles";
import { useWorkLogForm } from "./hooks/useWorkLogForm";
import { Textarea } from "@/shared/components/Textarea";
import { FormField } from "@/shared/components/FormField";

// Yeni iş və ya redaktə: tarix, yer, görülən iş, işlədilən material, akt/şəkil/video; yeni işdə qaralama saxlanır
export function WorkLogForm(props: WorkLogFormProps) {
  const { employeeId, employeeName, existing, onClose } = props;
  const {
    draft, places, place, setPlace, formRef, held, used, use, act, setAct, photos, setPhotos, video, setVideo, setVideoBusy, removed, toggleRemove,
    confirmData, setConfirmData, pending, saveDraft, onSubmit, save, hasAct,
  } = useWorkLogForm(props);
  return (
    <Modal onClose={onClose} labelledBy="work-form-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="work-form-title" className="text-lg font-bold">{existing ? "İşi redaktə et" : "Yeni iş"}</h2>
          <p className="muted text-sm">{employeeName}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      <form ref={formRef} onSubmit={onSubmit} onChange={() => saveDraft()} className="space-y-4">
        {draft && <DraftNotice onDiscard={() => { writeDraft(employeeId, null); onClose(); }} />}
        <FormField label="Tarix">
          <DatePicker name="work_date" defaultValue={existing?.work_date ?? draft?.work_date ?? today()} max={today()} required />
        </FormField>

        <div>
          <span className="label">Yer</span>
          <PlacePicker places={places} value={place} onChange={(p) => { setPlace(p); saveDraft({ place: p }); }} />
        </div>

        <FormField label="Görülən iş">
          <Textarea name="description" rows={3} required className="resize-none" defaultValue={existing?.description ?? draft?.description}
            placeholder="Məs. 2 ədəd split kondisionerin profilaktikası, freon dolduruldu" />
        </FormField>

        <MaterialsUsed held={held} used={used} onUse={use} />
        {existing && existing.files.length > 0 && <ExistingFilesEditor files={existing.files} removed={removed} onToggle={toggleRemove} />}
        <NewWorkFiles act={act} hasAct={hasAct} photos={photos} video={video}
          onAct={setAct} onPhotos={setPhotos} onVideo={setVideo} onVideoBusy={setVideoBusy} />
        <VideoSummary value={video} onRemove={() => setVideo(null)} />

        <Buttons pending={pending} label={existing ? "Yadda saxla" : "İşi yadda saxla"} onCancel={onClose} />
        <ConfirmModal
          open={!!confirmData}
          title="Məlumatların doğruluğunu təsdiq edirsinizmi?"
          message="İşdəki dəyişikliklər yadda saxlanılacaq."
          confirmLabel="Bəli, yadda saxla"
          onCancel={() => setConfirmData(null)}
          onConfirm={() => {
            const form = confirmData;
            setConfirmData(null);
            if (form) save(form);
          }}
        />
      </form>
    </Modal>
  );
}
