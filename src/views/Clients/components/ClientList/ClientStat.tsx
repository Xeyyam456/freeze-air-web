import type { ClientStatProps } from "@/types/clients";

// Kartdakı kiçik rəqəm xanası
export function ClientStat({ label, value, tone = "" }: ClientStatProps) {
  return (
    <div className="min-w-0 rounded-xl bg-bg px-3 py-2">
      <p className="muted truncate text-[11px] font-semibold uppercase tracking-wide max-[400px]:text-[10px] max-[400px]:tracking-normal">{label}</p>
      <p className={`text-lg font-extrabold tabular-nums leading-tight ${tone}`}>{value}</p>
    </div>
  );
}
