import { AC_ILLUSTRATION } from "../AcIllustrations";
import { isIllustrated } from "@/lib/site-content";
import type { Segment } from "@/types/site";

// Şəkil kəsiləndə hansı hissəsi görünsün (admin seçir)
const POSITION: Record<string, string> = { top: "object-top", center: "object-center", bottom: "object-bottom" };

// Obyekt növünün vizualı: admin şəkil yükləyibsə şəkil, yoxdursa ilk avadanlığın illüstrasiyası
export function SegmentVisual({ segment, className = "", artClassName = "w-full max-w-[220px]" }: {
  segment: Segment;
  className?: string;
  artClassName?: string;
}) {
  if (segment.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
      <img src={segment.image_url} alt={segment.title} className={`h-full w-full object-cover ${POSITION[segment.image_position] ?? "object-center"} ${className}`} />
    );
  }
  // İlk illüstrasiyalı avadanlıq; heç biri yoxdursa split
  const Art = AC_ILLUSTRATION[segment.equipment.find(isIllustrated) ?? "split"];
  return (
    <div className={`grid h-full w-full place-items-center bg-gradient-to-br from-ice to-glacier p-6 ${className}`}>
      <Art className={artClassName} />
    </div>
  );
}
