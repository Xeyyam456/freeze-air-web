import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSegments } from "@/lib/site-content";
import { getTexts } from "@/lib/site-texts";
import { SegmentVisual } from "./SegmentVisual";
import { Spotlight } from "./Spotlight";

// Obyekt növlərinin kartları (bazadan): ana səhifədə ətraflı, Xidmətlər səhifəsində yığcam
export async function SegmentCards({ compact = false }: { compact?: boolean }) {
  const [segments, t] = await Promise.all([getSegments(), getTexts()]);

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {segments.map((s) => (
        <Spotlight key={s.id} className="rounded-[28px]">
        <Link href={`/xidmetler/${s.slug}`}
          className={`group block h-full overflow-hidden rounded-[28px] bg-white transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(6,25,43,0.14)] ${compact ? "" : "border border-night/10"}`}>
          <div className={`overflow-hidden ${compact ? "h-40" : "h-48"}`}>
            <SegmentVisual segment={s} className="transition-transform duration-700 group-hover:scale-110" />
          </div>
          {compact ? (
            <div className="flex items-center justify-between gap-3 p-5">
              <span className="font-display font-bold">{s.title}</span>
              <ArrowRight size={18} className="shrink-0 text-cold transition-transform group-hover:translate-x-1" />
            </div>
          ) : (
            <div className="p-6">
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
              {s.summary && <p className="mt-2 text-sm text-night/60">{s.summary}</p>}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-cold">{t["home.segments.more"]} <ArrowRight size={15} /></span>
            </div>
          )}
        </Link>
        </Spotlight>
      ))}
    </div>
  );
}

// Yüklənərkən kartların yeri
export function SegmentCardsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => <div key={i} className="h-72 rounded-[28px] bg-glacier" />)}
    </div>
  );
}
