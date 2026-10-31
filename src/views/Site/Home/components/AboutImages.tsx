import { ClipboardCheck } from "lucide-react";
import { OutdoorUnit, SplitUnit } from "@/components/landing/AcIllustrations";
import { Reveal } from "@/components/landing/Reveal";
import type { AboutImagesProps } from "@/types/site";
import { CARD_COLORS } from "../constants/aboutColors";

// Şəkillər pərdə kimi soldan açılır (.reveal-wipe), rəngli kart yavaşca "nəfəs alır" (.float-soft); şəkil yoxdursa illüstrasiya
export function AboutImages({ about: a }: AboutImagesProps) {
  const color = CARD_COLORS[a.cardColor];
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <Reveal className="reveal-wipe col-span-2">
        {a.mainImage
          // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
          ? <img src={a.mainImage} alt="" className="block h-auto w-full rounded-[28px]" />
          : <div className="grid place-items-center rounded-[28px] bg-white p-8"><OutdoorUnit className="w-full max-w-[320px]" /></div>}
      </Reveal>
      <Reveal className="reveal-wipe self-center" delay={180}>
        {a.sideImage
          // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
          ? <img src={a.sideImage} alt="" className="block h-auto w-full rounded-[28px]" />
          : <div className="grid place-items-center rounded-[28px] bg-ice p-6"><SplitUnit className="w-full" /></div>}
      </Reveal>
      {/* Mobildə kart yarım endədir: kənar boşluq və başlıq kiçilir */}
      <div className={`float-soft flex flex-col justify-center rounded-[28px] p-4 sm:p-6 ${color.box}`}>
        <ClipboardCheck size={30} className={color.icon} />
        <p className="mt-3 font-display text-base font-bold sm:text-lg">{a.cardTitle}</p>
        {a.cardText && <p className={`mt-1 text-sm ${color.sub}`}>{a.cardText}</p>}
      </div>
    </div>
  );
}
