import { X } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import type { PlaceLocationModalProps } from "@/types/clients";
import { AddressSection } from "./AddressSection";
import { CoordinateSection } from "./CoordinateSection";

export function PlaceLocationModal({ place, loc, onClose }: PlaceLocationModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="loc-title" className="!max-w-lg">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="loc-title" className="text-lg font-bold">Konumu düzəlt</h2>
          <p className="muted truncate text-sm">{place.code ? `${place.code} · ` : ""}{place.name}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <AddressSection place={place} loc={loc} />
      <CoordinateSection place={place} loc={loc} />
    </Modal>
  );
}
