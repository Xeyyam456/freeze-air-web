"use client";

import { useActionState, useRef, useTransition } from "react";
import { Mail, MessageSquare, Phone, Send, User } from "lucide-react";
import { sendContactRequest, type ContactFormState } from "@/app/(site)/elaqe/actions";
import type { Texts } from "@/lib/site-texts";
import { toast } from "@/lib/toast";

// Sahə qutusu (ikon + input): fokus qutunun özünə düşür (focus-within)
const field =
  "flex items-center gap-3 rounded-2xl border border-night/10 bg-glacier/70 px-4 text-night/40 transition-all focus-within:border-cold focus-within:bg-white focus-within:text-cold focus-within:shadow-[0_0_0_4px_rgba(0,163,217,0.12)]";
const fieldIcon = "shrink-0";
const input = "h-14 w-full bg-transparent text-night outline-none placeholder:text-night/35";

// "Bizə yazın": ad, telefon, e-poçt (istəyə bağlı), mesaj → admin panelində "Müraciətlər". Mətnlər bazadan (t).
// Nəticə tostla bildirilir; uğurda forma təmizlənir, xətada yazılanlar qalır.
export function ContactForm({ t }: { t: Texts }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [, startTransition] = useTransition();
  const [, action, pending] = useActionState(async (prev: ContactFormState, formData: FormData) => {
    const result = await sendContactRequest(prev, formData);
    if (result?.ok) {
      toast.success(t["form.success_title"], t["form.success_text"]);
      formRef.current?.reset();
    } else if (result?.error) {
      toast.error(result.error);
    }
    return result;
  }, null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => action(formData));
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex h-full flex-col rounded-[32px] bg-white p-8 ring-1 ring-night/5 sm:p-10">
      <h2 className="font-display text-3xl font-bold">{t["form.title"]}</h2>
      <p className="mt-2 text-night/60">{t["form.lead"]}</p>

      {/* Sahələr: solda ikon, fokusda göy haşiyə və yumşaq halqa */}
      <div className="mt-8 grid flex-1 content-start gap-3 sm:grid-cols-2">
        <label className="sr-only" htmlFor="cf-name">{t["form.name"]}</label>
        <span className={field}>
          <User size={18} className={fieldIcon} />
          <input id="cf-name" name="name" required maxLength={100} placeholder={t["form.name"]} autoComplete="name" className={input} />
        </span>
        <label className="sr-only" htmlFor="cf-phone">{t["form.phone"]}</label>
        <span className={field}>
          <Phone size={18} className={fieldIcon} />
          <input id="cf-phone" name="phone" type="tel" required maxLength={30} placeholder={t["form.phone"]} autoComplete="tel" className={input} />
        </span>
        <label className="sr-only" htmlFor="cf-email">{t["form.email"]}</label>
        <span className={`${field} sm:col-span-2`}>
          <Mail size={18} className={fieldIcon} />
          <input id="cf-email" name="email" type="email" maxLength={120} placeholder={t["form.email"]} autoComplete="email" className={input} />
        </span>
        <label className="sr-only" htmlFor="cf-message">{t["form.message"]}</label>
        <span className={`${field} items-start sm:col-span-2`}>
          <MessageSquare size={18} className={`${fieldIcon} mt-4`} />
          <textarea id="cf-message" name="message" rows={5} maxLength={1000} placeholder={t["form.message"]}
            className={`${input} h-auto resize-none py-3.5`} />
        </span>
        {/* Botlar üçün tələ: insan görmür */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      </div>

      <button type="submit" disabled={pending}
        className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-night text-lg font-bold text-white shadow-[0_14px_30px_rgba(6,25,43,0.22)] transition-all hover:-translate-y-px hover:bg-cold hover:shadow-[0_16px_34px_rgba(0,163,217,0.35)] disabled:translate-y-0 disabled:opacity-60">
        <Send size={19} /> {pending ? t["form.sending"] : t["form.submit"]}
      </button>
    </form>
  );
}
