"use client";

import { useActionState, useRef, useTransition } from "react";
import { PhoneCall } from "lucide-react";
import { sendContactRequest } from "@/app/(site)/elaqe/actions";
import { toast } from "@/lib/toast";
import type { ContactFormState, Texts } from "@/types/site";

const input =
  "h-12 w-full rounded-2xl border border-transparent bg-white px-4 text-night outline-none transition-colors placeholder:text-night/40 focus:border-cold";

// Hero-dakı sürətli müraciət: yalnız ad və telefon; "Bizə yazın" ilə eyni server action (müraciət admin panelinə düşür, spam limiti bazadadır).
export function HeroQuickForm({ t }: { t: Texts }) {
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
    <form ref={formRef} onSubmit={onSubmit} aria-label={t["home.quick.title"]}
      className="mt-9 max-w-xl rounded-[28px] bg-white/10 p-2.5 ring-1 ring-white/20 backdrop-blur-md sm:flex sm:items-center sm:gap-2">
      <label className="sr-only" htmlFor="hq-name">{t["home.quick.name"]}</label>
      <input id="hq-name" name="name" required maxLength={100} placeholder={t["home.quick.name"]} autoComplete="name" className={`${input} sm:flex-[0.9]`} />
      <label className="sr-only" htmlFor="hq-phone">{t["home.quick.phone"]}</label>
      <input id="hq-phone" name="phone" type="tel" required maxLength={30} placeholder={t["home.quick.phone"]} autoComplete="tel" className={`${input} mt-2 sm:mt-0 sm:flex-1`} />
      {/* Botlar üçün tələ: insan görmür */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <button type="submit" disabled={pending}
        className="mt-2 inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-heat px-5 font-bold text-night transition-all hover:bg-[#ffb347] active:scale-[0.98] disabled:opacity-60 sm:mt-0 sm:w-auto">
        <PhoneCall size={17} /> {pending ? t["form.sending"] : t["home.quick.button"]}
      </button>
    </form>
  );
}
