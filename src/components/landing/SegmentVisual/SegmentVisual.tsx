import Image from "next/image";
import type { SegmentVisualProps } from "@/types/site";
import { AC_ILLUSTRATION } from "../AcIllustrations";
import { isIllustrated } from "@/lib/site-content";

// Şəkil kəsiləndə hansı hissəsi görünsün (admin seçir)
const POSITION: Record<string, string> = { top: "object-top", center: "object-center", bottom: "object-bottom" };

// Obyekt növünün vizualı: admin şəkil yükləyibsə şəkil, yoxdursa ilk avadanlığın illüstrasiyası
export function SegmentVisual({ segment, className = "", artClassName = "w-full max-w-[220px]" }: SegmentVisualProps) {
  if (segment.image_url) {
    return (
      <Image width={1600} height={1000} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" src={segment.image_url} alt={segment.title} className={`h-full w-full object-cover ${POSITION[segment.image_position] ?? "object-center"} ${className}`} />
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
