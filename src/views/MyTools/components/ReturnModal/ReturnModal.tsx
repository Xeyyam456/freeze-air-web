import { useState } from "react";
import { Send, Undo2 } from "lucide-react";
import { DHead } from "@/views/Depot/components/DHead";
import { Modal } from "@/shared/components/Modal";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { Mine } from "@/types/myTools/Mine";
import type { Draft } from "@/types/myTools/Draft";
import { emptyDraft, calc } from "@/views/MyTools/utils/draft";
import { ReturnLine } from "@/views/MyTools/components/ReturnLine";

// Qaytarma (bir və ya bir neçə): hər biri ayrıca sorğu olur, depo məsulu qəbul edəndə səndən çıxır
export function ReturnModal({ holds, employeeId, onClose }: { holds: Mine[]; employeeId: number; onClose: () => void }) {
  const [drafts, setDrafts] = useState<Record<number, Draft>>(() => Object.fromEntries(holds.map((h) => [h.id, emptyDraft(h)])));
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const checks = holds.map((h) => ({ h, c: calc(h, drafts[h.id]) }));
  const ready = checks.every((x) => x.c.ok);

  async function submit() {
    if (!ready) return toast.error("Hər sətirdə nə qədər qaytardığını düzgün yaz.");
    setPending(true);
    let failed = 0;
    for (const { h, c } of checks) {
      const material = h.tools!.kind === "material";
      const { error } = await createClient().rpc("depot_return_create", {
        p_assignment_id: h.id, p_quantity: material ? undefined : c.quantity, p_used: material ? c.used : undefined,
        p_returned: material ? c.returned : undefined, p_note: note.trim() || undefined,
      });
      if (error) { failed++; toast.error(`${h.tools!.name}: ${error.message}`); }
    }
    setPending(false);
    revalidate();
    if (failed < holds.length) toast.success(`${holds.length - failed} qaytarma sorğusu göndərildi: depo qəbul edəndə səndən çıxacaq`);
    if (!failed) onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="return-title" className="!max-w-xl">
      <DHead id="return-title" icon={Undo2} tone="blue" onClose={onClose}
        title={holds.length === 1 ? `Qaytar: ${holds[0].tools!.name}` : `${holds.length} şeyi qaytar`}
        sub="Depo məsulu əlində görüb qəbul edəndə səndən çıxır" />
      <ul className="nice-scroll max-h-[min(440px,calc(100dvh-300px))] divide-y divide-line overflow-y-auto rounded-2xl border border-line px-3">
        {holds.map((h) => (
          <ReturnLine key={h.id} h={h} d={drafts[h.id]} employeeId={employeeId} onChange={(d) => setDrafts((all) => ({ ...all, [h.id]: d }))} />
        ))}
      </ul>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Qeyd (istəyə görə)" aria-label="Qeyd" className="field mt-3" />
      <div className="mt-4 flex gap-2">
        <button type="button" disabled={pending || !ready} onClick={submit} className="btn btn-primary flex-1">
          <Send size={15} /> {pending ? "Göndərilir..." : holds.length === 1 ? "Sorğu göndər" : `${holds.length} sorğu göndər`}
        </button>
        <button type="button" onClick={onClose} className="btn btn-cancel">Ləğv et</button>
      </div>
    </Modal>
  );
}
