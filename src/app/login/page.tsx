"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ClipboardList, Eye, EyeOff, ListChecks, Lock, Mail, Snowflake, Warehouse } from "lucide-react";
import { ActionForm } from "@/components/forms";
import { login } from "./actions";
import { toast } from "@/lib/toast";

const FEATURES = [
  { icon: ListChecks, title: "Günün tapşırıqları", text: "Hansı yerdə, nə üçün gedəcəyin bir baxışda." },
  { icon: ClipboardList, title: "Gördüyün işlər", text: "İşi yaz, tarixçəyə və aylıq statistikaya bax." },
  { icon: Warehouse, title: "Alət və material", text: "Hansı alətin kimdə olduğunu depoya zəng etmədən gör." },
];

export default function LoginPage() {
  const [show, setShow] = useState(false);
  // Xəta tostla göstərilir (eyni xəta təkrar olanda da)
  const [, formAction, pending] = useActionState(async (prev: string | null, formData: FormData) => {
    const error = await login(prev, formData);
    if (error) toast.error(error);
    return error;
  }, null);

  return (
    <main className="grid min-h-screen bg-[#f4f7fc] lg:grid-cols-[1.1fr_1fr]">
      {/* Sol: tünd marka hissəsi */}
      <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#091428,#0f2447_55%,#123a6a)] p-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-frost/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
        <Snowflake size={420} strokeWidth={0.6} className="pointer-events-none absolute -bottom-24 -right-20 text-white/[0.05]" aria-hidden="true" />

        <div className="relative flex items-center gap-3">
          <span className="logo-mark"><Snowflake size={22} strokeWidth={2.4} /></span>
          <span className="text-lg font-extrabold">Freeze Air Service</span>
        </div>

        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-frost backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-frost" /> Usta paneli
          </span>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.08] tracking-tight">
            İş, tapşırıq və depo <span className="bg-gradient-to-r from-white to-frost bg-clip-text text-transparent">bir paneldə</span>
          </h1>
          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-frost shadow-[0_8px_20px_rgba(31,111,235,0.4)]">
                  <Icon size={19} />
                </span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="block text-sm text-white/65">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">© Freeze Air Service</p>
      </section>

      {/* Sağ: giriş kartı */}
      <section className="relative flex flex-col items-center justify-center px-6 py-10">
        <Link href="/" className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink lg:left-10 lg:top-10">
          <ArrowLeft size={16} /> Sayta qayıt
        </Link>

        {/* Dar ekranda sol hissə gizlidir: marka burada görünür */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <span className="logo-mark"><Snowflake size={22} strokeWidth={2.4} /></span>
          <span className="text-lg font-extrabold">Freeze Air Service</span>
        </div>

        <div className="w-full max-w-[420px] rounded-[28px] bg-white p-8 shadow-[0_30px_80px_rgba(15,36,71,0.12)] ring-1 ring-line sm:p-10">
          <ActionForm action={formAction} className="space-y-5">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Xoş gəldin</h2>
              <p className="muted mt-1.5 text-sm">Hesabınla daxil ol.</p>
            </div>

            <label className="block">
              <span className="label">E-poçt</span>
              <span className="relative block">
                <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input name="email" type="email" required autoComplete="email" placeholder="ad@example.com" className="field !h-12 !pl-11" />
              </span>
            </label>

            <label className="block">
              <span className="label">Parol</span>
              <span className="relative block">
                <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input name="password" type={show ? "text" : "password"} required autoComplete="current-password" placeholder="••••••••" className="field !h-12 !pl-11 !pr-12" />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Parolu gizlət" : "Parolu göstər"} aria-pressed={show}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-bg hover:text-ink">
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <button type="submit" disabled={pending} className="btn btn-primary !h-12 w-full !text-[15px]">
              {pending ? "Yoxlanılır..." : <>Daxil ol <ArrowRight size={17} /></>}
            </button>

            <p className="muted text-center text-xs leading-relaxed">Hesabı admin yaradır. Hesabın yoxdursa, rəhbərliyə müraciət et.</p>
          </ActionForm>
        </div>
      </section>
    </main>
  );
}
