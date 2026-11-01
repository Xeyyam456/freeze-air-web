"use client";

import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { History } from "lucide-react";
import type { PlaceHistoryButtonProps } from "@/types/myWork";
import { PlaceHistoryModal } from "./components/PlaceHistoryModal";

// Düymə + pəncərə (server komponentlərindən, məs. şirkətin vizit kartından işlətmək üçün)
export function PlaceHistoryButton({ target, variant = "soft", size = "sm", className }: PlaceHistoryButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)} className={className}>
        <History size={14} /> İş tarixçəsi
      </Button>
      {open && <PlaceHistoryModal target={target} onClose={() => setOpen(false)} />}
    </>
  );
}
