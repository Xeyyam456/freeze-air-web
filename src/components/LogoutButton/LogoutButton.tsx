"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

// Çıxış: təsadüfi klikdən qorunmaq üçün əvvəlcə təsdiq soruşulur
export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="grid h-[30px] w-[30px] place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
        title="Çıxış" aria-label="Çıxış">
        <LogOut size={15} />
      </button>
      <ConfirmModal
        open={open}
        icon={LogOut}
        title="Çıxmaq istəyirsən?"
        message="Yenidən daxil olmaq üçün e-poçt və parol lazım olacaq."
        confirmLabel="Bəli, çıx"
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() => startTransition(() => logout())}
      />
    </>
  );
}
