"use client";

import { useState } from "react";
import { initials } from "@/lib/experience";
import type { ProfileButtonProps } from "@/types/profile";
import { ProfileModal } from "../ProfileModal";

// Sol menyunun altındakı profil: klik → pəncərə. Əməkdaşa bağlı hesab öz şəklini burada qoyur/dəyişir/silir
export function ProfileButton({ me }: ProfileButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} title={`${me.name} — profili aç`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5 text-left hover:bg-white/10">
        {me.photoUrl
          // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
          ? <img src={me.photoUrl} alt="" className="avatar !h-9 !w-9 shrink-0 object-cover" />
          : <span className="avatar !h-9 !w-9 shrink-0">{initials(me.name)}</span>}
        <span className="nav-label min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold text-white">{me.name}</span>
          <span className="block truncate text-[11px] text-white/55">{me.role}</span>
        </span>
      </button>
      {open && <ProfileModal me={me} onClose={() => setOpen(false)} />}
    </>
  );
}
