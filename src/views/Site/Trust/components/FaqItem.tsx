import s from "../styles/FaqItem.module.css";
import { Plus } from "lucide-react";
import { tone } from "@/components/landing/tones";
import type { FaqItemProps } from "@/types/site";

// Bir sual: <details> (JS-siz işləyir); name — eyni anda bir sual açıq
export function FaqItem({ item: f, index = 0 }: FaqItemProps & { index?: number }) {
  return (
    <details name="home-faq" style={tone(index)} className={`${s.item} group relative overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(6,25,43,0.04)] ring-1 ring-night/5 transition-all hover:ring-[color-mix(in_srgb,var(--tone)_40%,transparent)] open:bg-[linear-gradient(100deg,color-mix(in_srgb,var(--tone)_9%,white),white_55%)] open:shadow-[0_16px_40px_color-mix(in_srgb,var(--tone)_16%,transparent)] open:ring-[color-mix(in_srgb,var(--tone)_35%,transparent)]`}>
      <summary className="flex list-none items-center justify-between gap-4 px-6 py-5 font-display text-base font-bold [&::-webkit-details-marker]:hidden">
        {f.question}
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--tone)_14%,white)] text-(--tone) transition-all duration-300 group-open:rotate-45 group-open:bg-(--tone) group-open:text-white group-open:shadow-[0_6px_16px_color-mix(in_srgb,var(--tone)_45%,transparent)]">
          <Plus size={18} />
        </span>
      </summary>
      <p className="faq-answer px-6 pb-6 text-night/65">{f.answer}</p>
    </details>
  );
}
