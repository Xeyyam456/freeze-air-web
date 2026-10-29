import { Lock } from "lucide-react";
import type { MyTasksSectionProps } from "@/types/myTasks";
import { MyTaskCard } from "../MyTaskCard";

// Mənim tapşırıqlarım: iri kartlar, işarələmək yalnız burada
export function MyTasksSection({ mine, liveCount, data, past, logOf, onToggle, onNote, onViewLog }: MyTasksSectionProps) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
        Mənim tapşırıqlarım
        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{liveCount}</span>
        {past && (
          <span className="muted ml-auto flex items-center gap-1.5 text-xs font-semibold">
            <Lock size={13} /> Keçmiş gün: yalnız baxış
          </span>
        )}
      </h2>
      {/* Natamam son sıra bütün eni tutur (tək kart yarı endə qalmır) */}
      <ul className="flex flex-wrap gap-3">
        {mine.map((t) => (
          <MyTaskCard key={t.id} t={t} data={data} past={past} fileLog={logOf(t)}
            onToggle={() => onToggle(t)} onNote={() => onNote(t)} onViewLog={onViewLog} />
        ))}
      </ul>
    </section>
  );
}
