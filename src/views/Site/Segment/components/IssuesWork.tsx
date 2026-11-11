import { CircleAlert, CircleCheck } from "lucide-react";
import type { SegmentBlockProps } from "@/types/site";

// Problemlər və görülən işlər
export function IssuesWork({ segment, t }: SegmentBlockProps) {
  if (segment.issues.length === 0 && segment.work.length === 0) return null;
  return (
    <section className="site-wrap mt-14 grid gap-4 md:grid-cols-2">
      {segment.issues.length > 0 && (
        <div className="relative overflow-hidden rounded-[28px] bg-white bg-[radial-gradient(70%_50%_at_100%_0%,rgba(255,159,28,0.16),transparent)] p-8 ring-1 ring-heat/20">
          <h2 className="font-display text-2xl font-bold">{t["segment.issues"]}</h2>
          <ul className="mt-6 space-y-4">
            {segment.issues.map((i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-heat/15 text-heat"><CircleAlert size={16} /></span> <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {segment.work.length > 0 && (
        <div className="aurora relative overflow-hidden rounded-[28px] bg-night bg-[radial-gradient(70%_50%_at_0%_100%,color-mix(in_srgb,var(--tone)_32%,transparent),transparent)] p-8 text-white">
          <h2 className="font-display text-2xl font-bold">{t["segment.work"]}</h2>
          <ul className="mt-6 space-y-4">
            {segment.work.map((w) => (
              <li key={w} className="flex items-start gap-3">
                <CircleCheck size={20} className="mt-0.5 shrink-0 text-(--tone) brightness-125" /> <span className="text-white/85">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
