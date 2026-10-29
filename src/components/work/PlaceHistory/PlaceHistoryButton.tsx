"use client";

import { useState } from "react";
import { History } from "lucide-react";
import type { PlaceHistoryButtonProps } from "@/types/myWork";
import { PlaceHistoryModal } from "./PlaceHistoryModal";

// Düymə + pəncərə (server komponentlərindən, məs. şirkətin vizit kartından işlətmək üçün)
export function PlaceHistoryButton({ target, className = "btn btn-soft btn-sm" }: PlaceHistoryButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <History size={14} /> İş tarixçəsi
      </button>
      {open && <PlaceHistoryModal target={target} onClose={() => setOpen(false)} />}
    </>
  );
}
