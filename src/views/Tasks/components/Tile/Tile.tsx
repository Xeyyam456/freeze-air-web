import type { TileProps } from "@/types/myTasks";

export function Tile({ label, value, tone = "" }: TileProps) {
  return (
    <div className="card flex flex-col justify-center !py-3 max-sm:!px-3 max-sm:!py-2">
      <span className="muted text-xs font-medium">{label}</span>
      <span className={`text-2xl font-extrabold tabular-nums max-sm:text-xl max-sm:leading-tight ${tone}`}>{value}</span>
    </div>
  );
}
