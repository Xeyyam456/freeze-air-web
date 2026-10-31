import { Camera, Check, Moon, Pencil, Sun } from "lucide-react";
import type { StepProps } from "@/types/myFuel";
import { useStep } from "../../hooks/useStep";
import { timeBaku } from "../../shared/dates";
import { SignedPhoto } from "../SignedPhoto";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";

// Səhər / axşam addımı: şəkil + km; yazılıbsa göstərir, bu gün ərzində "Dəyiş" ilə düzəlmək olur
export function Step(props: StepProps) {
  const { kind, value, photo, at, min, disabled } = props;
  const s = useStep(props);
  const Icon = kind === "start" ? Sun : Moon;
  const title = kind === "start" ? "Səhər: işə başlayanda" : "Axşam: işi bitirəndə";

  return (
    <section className={`card flex min-w-0 grow basis-[340px] flex-col gap-3 !p-4 max-sm:basis-full max-sm:gap-2 max-sm:!p-3 ${disabled ? "opacity-60" : ""}`}>
      <header className="flex items-center gap-2.5 max-sm:gap-2">
        <span className={`grid h-9 w-9 max-sm:h-7 max-sm:w-7 shrink-0 place-items-center rounded-xl ${s.done ? "bg-ok-soft text-ok" : "bg-primary-soft text-primary"}`}>
          {s.done ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold max-sm:text-sm">{title}</span>
          <span className="muted block truncate text-xs max-sm:text-[11px]">{s.done && at ? `Yazılıb: ${timeBaku(at)}` : disabled ? "Əvvəl səhər km-ini yaz" : "Spidometrin şəkli + km"}</span>
        </span>
        {s.done && !disabled && (
          <Button type="button" onClick={s.startEdit} variant="soft" size="sm" className="max-sm:!h-7 max-sm:!px-2.5" aria-label="Dəyiş"><Pencil size={13} /> Dəyiş</Button>
        )}
      </header>

      {s.done ? (
        <div className="flex items-center gap-3">
          <SignedPhoto path={photo} alt={title} />
          <p className="text-2xl font-extrabold tabular-nums max-sm:text-xl">{value!.toLocaleString("az")} <span className="muted text-sm font-semibold">km</span></p>
        </div>
      ) : (
        <form onSubmit={s.submit} className="flex flex-wrap items-end gap-3 max-sm:gap-2">
          <label className={`grid h-16 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border-2 border-dashed ${
            s.preview || photo ? "border-primary" : "border-line hover:border-primary"} ${disabled ? "pointer-events-none" : ""}`} title="Şəkil çək və ya seç">
            {s.preview
              // eslint-disable-next-line @next/next/no-img-element -- yerli önizləmə
              ? <img src={s.preview} alt="Önizləmə" className="h-full w-full object-cover" />
              : <span className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-primary"><Camera size={18} /> Şəkil</span>}
            {/* capture yoxdur: telefon "Kamera / Qalereya" seçimini özü təklif edir */}
            <input type="file" accept="image/*" className="sr-only" disabled={disabled}
              onChange={(e) => s.pick(e.target.files?.[0] ?? null)} />
          </label>
          <label className="min-w-[140px] flex-1">
            <span className="label">Spidometr (km)</span>
            <Input value={s.km} onChange={(e) => s.setKm(e.target.value)} inputMode="numeric" disabled={disabled}
              placeholder={min !== undefined ? `≥ ${min}` : "məs. 52 000"} className="tabular-nums" />
          </label>
          <div className="flex gap-2 max-xl:w-full max-xl:[&>button]:flex-1">
            {s.editing && <Button type="button" onClick={s.cancel} variant="soft">Ləğv et</Button>}
            <Button type="submit" disabled={s.pending || disabled}>{s.pending ? "..." : "Yadda saxla"}</Button>
          </div>
        </form>
      )}
    </section>
  );
}
