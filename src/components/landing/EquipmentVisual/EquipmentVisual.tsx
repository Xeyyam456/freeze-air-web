import Image from "next/image";
import type { EquipmentVisualProps } from "@/types/site";
import { Snowflake } from "lucide-react";
import { isIllustrated } from "@/lib/illustrated";
import { AC_ILLUSTRATION } from "../AcIllustrations";

// Avadanlığın vizualı: admin şəkil yükləyibsə şəkil, yoxdursa hazır illüstrasiya, o da yoxdursa ikon
export function EquipmentVisual({ item, className = "", artClassName = "w-full max-w-[220px]" }: EquipmentVisualProps) {
  if (item.image_url) {
    return (
      // object-contain: şəkil heç vaxt kəsilmir, nisbəti fərqlidirsə kənarlarda fon görünür
      <div className={`h-full w-full bg-gradient-to-br from-ice to-glacier ${className}`}>
        <Image width={1600} height={1000} sizes="(min-width: 1024px) 33vw, 100vw" src={item.image_url} alt={item.title} className="h-full w-full object-contain" />
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
