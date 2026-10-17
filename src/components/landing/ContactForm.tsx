"use client";

import { useActionState, useRef, useTransition } from "react";
import { Send } from "lucide-react";
import { sendContactRequest, type ContactFormState } from "@/app/(site)/elaqe/actions";
import type { Texts } from "@/lib/site-texts";
import { toast } from "@/lib/toast";

const input =
  "h-12 w-full rounded-2xl border border-night/10 bg-glacier px-4 text-night outline-none transition-colors placeholder:text-night/35 focus:border-cold focus:bg-white";

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
    <form ref={formRef} onSubmit={onSubmit} className="rounded-[28px] bg-white p-7 sm:p-9">
      <h2 className="font-display text-2xl font-bold">{t["form.title"]}</h2>
      <p className="mt-1 text-night/60">{t["form.lead"]}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="sr-only" htmlFor="cf-name">{t["form.name"]}</label>
        <input id="cf-name" name="name" required maxLength={100} placeholder={t["form.name"]} autoComplete="name" className={input} />
        <label className="sr-only" htmlFor="cf-phone">{t["form.phone"]}</label>
        <input id="cf-phone" name="phone" type="tel" required maxLength={30} placeholder={t["form.phone"]} autoComplete="tel" className={input} />
        <label className="sr-only" htmlFor="cf-email">{t["form.email"]}</label>
        <input id="cf-email" name="email" type="email" maxLength={120} placeholder={t["form.email"]} autoComplete="email" className={`${input} sm:col-span-2`} />
        <label className="sr-only" htmlFor="cf-message">{t["form.message"]}</label>
        <textarea id="cf-message" name="message" rows={4} maxLength={1000} placeholder={t["form.message"]}
          className={`${input} h-auto resize-none py-3 sm:col-span-2`} />
        {/* Botlar üçün tələ: insan görmür */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      </div>

      <button type="submit" disabled={pending}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-cold px-7 font-bold text-white transition-colors hover:bg-night disabled:opacity-60">
        <Send size={18} /> {pending ? t["form.sending"] : t["form.submit"]}
      </button>
    </form>
  );
}
