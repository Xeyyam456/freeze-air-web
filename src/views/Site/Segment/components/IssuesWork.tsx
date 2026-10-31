import { CircleAlert, CircleCheck } from "lucide-react";
import type { SegmentBlockProps } from "@/types/site";

// Problemlər və görülən işlər
export function IssuesWork({ segment, t }: SegmentBlockProps) {
  if (segment.issues.length === 0 && segment.work.length === 0) return null;
  return (
    <section className="site-wrap mt-14 grid gap-4 md:grid-cols-2">
      {segment.issues.length > 0 && (
        <div className="rounded-[28px] bg-white p-8">
          <h2 className="font-display text-2xl font-bold">{t["segment.issues"]}</h2>
          <ul className="mt-6 space-y-4">
            {segment.issues.map((i) => (
              <li key={i} className="flex items-start gap-3">
                <CircleAlert size={20} className="mt-0.5 shrink-0 text-heat" /> <span>{i}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {segment.work.length > 0 && (
        <div className="aurora relative overflow-hidden rounded-[28px] bg-night p-8 text-white">
          <h2 className="font-display text-2xl font-bold">{t["segment.work"]}</h2>
          <ul className="mt-6 space-y-4">
            {segment.work.map((w) => (
              <li key={w} className="flex items-start gap-3">
                <CircleCheck size={20} className="mt-0.5 shrink-0 text-cold" /> <span className="text-white/85">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
