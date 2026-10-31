import Link from "next/link";
import { ArrowRight, Lightbulb } from "lucide-react";
import type { SegmentBlockProps } from "@/types/site";

// Qeyd və çağırış: ≥ 640 düymə həmişə sağda, mətnlə bir sırada
export function SegmentNote({ segment, t }: SegmentBlockProps) {
  return (
    <section className="site-wrap mt-4">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-gradient-to-r from-cold to-[#0086c3] p-8 text-white shadow-[0_20px_50px_rgba(0,163,217,0.25)] sm:flex-nowrap">
        {segment.note
          ? <p className="flex min-w-0 max-w-3xl items-start gap-3 text-lg"><Lightbulb size={24} className="mt-0.5 shrink-0" /> {segment.note}</p>
          : <p className="min-w-0 text-lg">{t["segment.note_fallback"]}</p>}
        <Link href="/elaqe" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 font-bold text-night transition-all hover:-translate-y-px hover:bg-night hover:text-white max-sm:w-full">
          {t["segment.cta"]} <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
