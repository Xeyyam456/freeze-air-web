import type { DaySummaryProps } from "@/types/myTasks";
import { Ring } from "../Ring";
import { Tile } from "../Tile";

// Mənim günüm (halqa) + komandanın rəqəmləri
export function DaySummary({ me, mineLive, total, done, people }: DaySummaryProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <section className="flex items-center gap-5 rounded-[18px] max-sm:gap-3 max-sm:px-4 max-sm:py-3 bg-[#0c1b36] bg-[radial-gradient(420px_200px_at_100%_0%,rgba(34,195,230,0.22),transparent_70%)] px-6 py-5 text-white">
        <Ring done={mineLive.filter((t) => t.done).length} total={mineLive.length} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Mənim günüm</p>
          <p className="mt-1 text-xl font-extrabold max-sm:mt-0 max-sm:text-base">
            {me === null ? "Əməkdaş kartın yoxdur"
              : mineLive.length === 0 ? "Sənə tapşırıq verilməyib"
              : mineLive.every((t) => t.done) ? "Hamısı görülüb 🎉"
              : `${mineLive.filter((t) => !t.done).length} tapşırıq qalıb`}
          </p>
          <p className="mt-0.5 text-sm text-white/55 max-sm:hidden">Görüldü işarələyəndə iş avtomatik «Görülən işlər»ə düşür.</p>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4">
        <Tile label="Cəmi tapşırıq" value={total} />
        <Tile label="Görülən" value={done} tone="text-ok" />
        <Tile label="Qalan" value={total - done} tone={total - done ? "text-primary" : ""} />
        <Tile label="Usta" value={people} />
      </div>
    </div>
  );
}
