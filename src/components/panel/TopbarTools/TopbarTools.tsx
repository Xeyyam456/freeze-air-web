"use client";

import s from "./TopbarTools.module.css";
import { Menu } from "lucide-react";
import { emitPanel, PANEL_EVENTS } from "../nav";

// < 1024: sol menyunu açan ☰ düyməsi (başlığın solunda)
export function MenuButton() {
  return (
    <button type="button" onClick={() => emitPanel(PANEL_EVENTS.menu)} className={`${s.icon} lg:hidden`} aria-label="Menyunu aç">
      <Menu size={20} />
    </button>
  );
}

