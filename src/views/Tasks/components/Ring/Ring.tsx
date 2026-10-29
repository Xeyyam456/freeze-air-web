import type { RingProps } from "@/types/myTasks";

// Halqa: görülən / cəmi (mənim günüm kartında)
export function Ring({ done, total }: RingProps) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const part = total ? done / total : 0;
  return (
    <div className="relative grid h-[76px] w-[76px] shrink-0 place-items-center max-sm:h-14 max-sm:w-14">
      <svg viewBox="0 0 76 76" className="absolute inset-0 -rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="7" />
        <circle cx="38" cy="38" r={r} fill="none" stroke="#4ade80" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - part)} className="transition-[stroke-dashoffset] duration-500" />
      </svg>
      <span className="text-lg font-extrabold tabular-nums max-sm:text-sm">{done}<span className="text-white/45">/{total}</span></span>
    </div>
  );
}
