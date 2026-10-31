import { Plus } from "lucide-react";
import type { FaqItemProps } from "@/types/site";

// Bir sual: <details> (JS-siz işləyir); name — eyni anda bir sual açıq
export function FaqItem({ item: f }: FaqItemProps) {
  return (
    <details name="home-faq" className="faq-item group rounded-2xl bg-white shadow-[0_1px_2px_rgba(6,25,43,0.04)] ring-1 ring-night/5 transition-shadow open:shadow-[0_16px_40px_rgba(6,25,43,0.08)]">
      <summary className="flex list-none items-center justify-between gap-4 px-6 py-5 font-display text-base font-bold [&::-webkit-details-marker]:hidden">
        {f.question}
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-glacier text-cold transition-all duration-300 group-open:rotate-45 group-open:bg-cold group-open:text-white">
          <Plus size={18} />
        </span>
      </summary>
      <p className="faq-answer px-6 pb-6 text-night/65">{f.answer}</p>
    </details>
  );
}
