import type { ClientStatProps } from "@/types/clients";

// Tünd kartdakı rəqəm
export function HeroStat({ label, value, tone = "" }: ClientStatProps) {
  return (
    <div>
      <dt className="text-xs text-white/55 max-sm:text-[11px]">{label}</dt>
      <dd className={`text-2xl font-extrabold tabular-nums leading-tight max-sm:text-xl ${tone}`}>{value}</dd>
    </div>
  );
}
