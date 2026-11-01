"use client";

import s from "./TopbarTools.module.css";
import { Button } from "@/shared/components/Button";
import { Menu, Plus } from "lucide-react";
import { emitPanel, PANEL_EVENTS } from "../nav";

// < 1024: sol menyunu açan ☰ düyməsi (başlığın solunda)
export function MenuButton() {
  return (
    <button type="button" onClick={() => emitPanel(PANEL_EVENTS.menu)} className={`${s.icon} lg:hidden`} aria-label="Menyunu aç">
      <Menu size={20} />
    </button>
  );
}

// Üst zolağın sağı: hər səhifədən "İş əlavə et". Axtarış sahəsi istifadəçi istəyi ilə yoxdur, yalnız Ctrl+K qısayolu (QuickActions).
export function TopbarTools() {
  return (
    <Button onClick={() => emitPanel(PANEL_EVENTS.addWork)} className={`${s.glow} !h-10 shrink-0 max-sm:!w-10 max-sm:!px-0`} title="Görülən işi yaz">
      <Plus size={18} strokeWidth={2.4} />
      <span className="max-sm:hidden">İş əlavə et</span>
    </Button>
  );
}
