import type { CalendarSummaryProps } from "@/types/attendance";

// Ayın xülasəsi: iş günü, işdə, icazəli, gəlmədi + bazar günü işi (yoxdursa bir sətir yazı; varsa bazar işi və cəmi işdə)
export function CalendarSummary({ summary: s }: CalendarSummaryProps) {
  const items = [
    { label: "İş günü", value: s.workdays, cls: "text-ink" },
    { label: "İşdə", value: s.present, cls: "text-ok" },
    { label: "İcazəli", value: s.leave, cls: "text-violet-600" },
    { label: "Gəlmədi", value: s.absent, cls: s.absent ? "text-danger" : "text-ink" },
  ];

  return (
    <>
      <div className="mt-4 grid grid-cols-4 gap-1.5 text-center">
        {items.map((x) => (
          <div key={x.label} className="rounded-lg bg-bg py-1.5">
            <p className={`text-base font-bold ${x.cls}`}>{x.value}</p>
            <p className="muted text-[11px] font-medium">{x.label}</p>
          </div>
        ))}
      </div>
      {s.extra > 0 ? (
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <div className="flex items-center justify-between gap-1.5 rounded-lg bg-slate-100 px-3 py-2 max-[360px]:px-2">
            <span className="whitespace-nowrap text-xs font-semibold leading-tight text-slate-600 max-[360px]:text-[11px]">Bazar günü işdə</span>
            <span className="text-base font-bold tabular-nums text-slate-700">{s.extra}</span>
          </div>
          <div className="flex items-center justify-between gap-1.5 rounded-lg bg-ok-soft px-3 py-2 max-[360px]:px-2">
            <span className="whitespace-nowrap text-xs font-semibold leading-tight text-ok max-[360px]:text-[11px]">Cəmi işdə</span>
            <span className="text-base font-bold tabular-nums text-ok">{s.present + s.extra}</span>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-nowrap rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-600">Bazar günü işdə olmayıb</p>
      )}
    </>
  );
}
