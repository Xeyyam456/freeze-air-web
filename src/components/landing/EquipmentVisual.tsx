import { Snowflake } from "lucide-react";
import { isIllustrated } from "@/lib/illustrated";
import type { Equipment } from "@/lib/site-content";
import { AC_ILLUSTRATION } from "./AcIllustrations";

// Avadanlığın vizualı: admin şəkil yükləyibsə şəkil, yoxdursa hazır illüstrasiya, o da yoxdursa ikon
export function EquipmentVisual({ item, className = "", artClassName = "w-full max-w-[220px]" }: {
  item: Pick<Equipment, "key" | "title" | "image_url">;
  className?: string;
  artClassName?: string;
}) {
  if (item.image_url) {
    return (
      // object-contain: şəkil heç vaxt kəsilmir, nisbəti fərqlidirsə kənarlarda fon görünür
      <div className={`h-full w-full bg-gradient-to-br from-ice to-glacier ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- storage şəkli */}
        <img src={item.image_url} alt={item.title} className="h-full w-full object-contain" />
      </div>
    );
  }
  return (
    <div className={`grid h-full w-full place-items-center bg-gradient-to-br from-ice to-glacier p-6 ${className}`}>
      {isIllustrated(item.key)
        ? (() => { const Art = AC_ILLUSTRATION[item.key]; return <Art className={artClassName} />; })()
        : <Snowflake size={56} strokeWidth={1.4} className="text-cold" />}
    </div>
  );
}
