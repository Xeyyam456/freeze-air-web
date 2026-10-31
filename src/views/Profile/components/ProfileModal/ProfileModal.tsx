import { UserRound, X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { ProfileModalProps } from "@/types/profile";
import { ProfilePhotoRow } from "./ProfilePhotoRow";

export function ProfileModal({ me, onClose }: ProfileModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="profile-title" className="!max-w-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="icon-tile !h-11 !w-11 shrink-0"><UserRound size={20} /></span>
          <div className="min-w-0">
            <h2 id="profile-title" className="text-lg font-bold">Profil</h2>
            <p className="muted truncate text-sm max-[400px]:text-[11px]" title={me.email}>{me.email}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      {me.employeeId
        ? <ProfilePhotoRow me={me} />
        : <p className="muted text-sm">Bu hesab heç bir əməkdaşa bağlı deyil, ona görə profil şəkli yoxdur.</p>}
      <p className="muted mt-4 text-xs">Ad, telefon və digər məlumatları rəhbərlik dəyişir.</p>
    </Modal>
  );
}
