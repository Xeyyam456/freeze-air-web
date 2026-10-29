import { Gauge } from "lucide-react";
import type { TodaySectionProps } from "@/types/myFuel";
import { DayResult } from "../DayResult";
import { Step } from "../Step";

// Bu gün: səhər və axşam addımları; axşam km yazılandan sonra günün yekunu
export function TodaySection({ loading, row, onSave }: TodaySectionProps) {
  const live = row?.km != null ? row : null; // axşam km yazılıb: gün bağlıdır
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold"><Gauge size={18} className="text-primary" /> Bu gün</h2>
      {loading ? (
        <div className="card muted py-10 text-center text-sm">Yüklənir...</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 max-sm:flex-col max-sm:gap-2">
            <Step kind="start" max={row?.end_km ?? undefined} value={row?.start_km ?? null} photo={row?.start_photo ?? null} at={row?.start_at ?? null}
              onSave={(km, file) => onSave("start", km, file)} />
            <Step kind="end" value={row?.end_km ?? null} photo={row?.end_photo ?? null} at={row?.end_at ?? null}
              min={row?.start_km} disabled={!row} onSave={(km, file) => onSave("end", km, file)} />
          </div>
          {live && <DayResult live={live} />}
        </>
      )}
    </section>
  );
}
