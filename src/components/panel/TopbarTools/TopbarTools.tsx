"use client";

import s from "./TopbarTools.module.css";
import { Menu } from "lucide-react";
import { useUnreadAnnouncements } from "@/lib/announcements-live";
import { emitPanel, PANEL_EVENTS } from "../nav";

// < 1024: sol menyunu açan ☰ düyməsi (başlığın solunda); oxunmamış elan varsa küncündə nöqtə (menyu bağlı olanda da görünsün)
export function MenuButton() {
  const unread = useUnreadAnnouncements();
  return (
    <button type="button" onClick={() => emitPanel(PANEL_EVENTS.menu)} className={`${s.icon} relative lg:hidden`}
      aria-label={unread ? `Menyunu aç: ${unread} oxunmamış elan` : "Menyunu aç"}>
      <Menu size={20} />
      {unread > 0 && <span className={s.dot} aria-hidden />}
    </button>
  );
}

