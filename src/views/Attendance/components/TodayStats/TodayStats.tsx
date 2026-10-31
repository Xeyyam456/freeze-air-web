import type { TodayStatsProps } from "@/types/attendance";
import { Card } from "@/shared/components/Card";

// Cari ayda: bu günün 6 göstəricisi. Mobildə ad həmişə 2 sətir ("|" yerində sətir sınır), bütün kartlar eyni hündürlükdə
export function TodayStats({ totals, ready }: TodayStatsProps) {
  const items = [
    { label: "Hazırda|işdə", value: totals.here, cls: "text-ok" },
    { label: "İşi|bitirib", value: totals.done, cls: "text-ink" },
    { label: "Bu gün|icazəli", value: totals.leave, cls: "text-violet-600" },
    { label: "Bu gün hələ|gəlməyib", value: totals.missing, cls: "text-ink" },
    { label: "Bu gün işdə|olmayıb", value: totals.absent, cls: totals.absent ? "text-danger" : "text-ink" },
    { label: "Gözləyən icazə|sorğusu", value: totals.pending, cls: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {items.map((x) => (
        <Card key={x.label} className="!py-3 max-sm:flex max-sm:items-center max-sm:justify-between max-sm:gap-2 max-sm:!px-3 max-sm:!py-1.5">
          <p className="muted text-xs font-semibold max-sm:text-[11px] max-sm:leading-[1.15]">{x.label.split("|").map((w, i) => <span key={i} className="max-sm:block">{i ? " " : ""}{w}</span>)}</p>
          <p className={`text-2xl font-extrabold max-sm:text-lg max-sm:leading-none ${x.cls}`}>{ready ? x.value : "…"}</p>
        </Card>
      ))}
    </div>
  );
}
