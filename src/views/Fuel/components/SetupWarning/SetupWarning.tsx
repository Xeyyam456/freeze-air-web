import type { SetupWarningProps } from "@/types/myFuel";

// Sərf, növ və ya qiymət yazılmayıbsa: km yazılır, məbləğ sonra hesablanır
export function SetupWarning({ per100, price, fuelName }: SetupWarningProps) {
  if (per100 && price) return null;
  return (
    <p className="rounded-xl bg-[#fff6e5] px-4 py-2.5 text-sm text-amber-800">
      {[!fuelName && "yanacaq növü", !per100 && "100 km-ə sərf", fuelName && !price && `${fuelName.toLowerCase()} qiyməti`].filter(Boolean).join(", ")} hələ
      yazılmayıb (admin yazır): km yazılır, məbləğ bunlar yazılandan sonra hesablanacaq.
    </p>
  );
}
