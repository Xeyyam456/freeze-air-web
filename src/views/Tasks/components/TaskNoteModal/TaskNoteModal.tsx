import { Buttons } from "@/components/forms";
import { VideoSummary } from "@/components/work/VideoPicker";
import { Modal } from "@/shared/components/Modal";
import type { TaskNoteModalProps } from "@/types/myTasks";
import { useTaskNote } from "../../hooks/useTaskNote";
import { ExistingFiles } from "../ExistingFiles";
import { NoteFilePickers } from "../NoteFilePickers";
import { Textarea } from "@/shared/components/Textarea";
import { FormField } from "@/shared/components/FormField";

// Görülmüş tapşırığın altına təmir barədə yazı və akt/şəkil əlavə etmək, əvvəl qoyulanları dəyişmək və ya silmək.
// İş artıq "Görülən işlər"dədir (✓ basılanda avtomatik düşüb): yazı həmin işin təsvirini yeniləyir (RPC task_set_note; yazı
// təmizlənsə təsvir tapşırığın səbəbinə qayıdır), fayllar həmin işə aiddir. Silmək "Yadda saxla" basanda olur (iş formundakı kimi).
export function TaskNoteModal(props: TaskNoteModalProps) {
  const { task, onClose } = props;
  const n = useTaskNote(props);
  return (
    <Modal onClose={onClose} labelledBy="task-note-title" className="!max-w-lg">
      <div className="mb-4">
        <h2 id="task-note-title" className="text-lg font-bold">Təmir barədə</h2>
        <p className="muted text-sm"><span className="font-semibold text-primary">{task.place}</span> — {task.reason}</p>
      </div>

      <form onSubmit={n.onSubmit} className="space-y-4">
        <FormField label="Nə edildi?">
          <Textarea name="note" rows={4} defaultValue={task.note ?? ""} autoFocus className="resize-none"
            placeholder="Məs. kompressor klapanı dəyişdirildi, qaz sızması aradan qalxdı, sistem yoxlanıldı" />
        </FormField>
        <ExistingFiles saved={n.saved} removed={n.removed} onToggle={n.toggleRemove} />
        <NoteFilePickers act={n.act} hasAct={n.hasAct} photos={n.photos} video={n.video}
          onAct={n.setAct} onPhotos={n.setPhotos} onVideo={n.setVideo} onVideoBusy={n.setVideoBusy} />
        <VideoSummary value={n.video} onRemove={() => n.setVideo(null)} />
        <Buttons pending={n.pending} label="Yadda saxla" onCancel={onClose} />
      </form>
    </Modal>
  );
}
