import { FileSpreadsheet, Fuel } from "lucide-react";
import { exportFuel } from "../../utils/excel/exportFuel";
import type { CarInfoProps } from "@/types/myFuel";

// Maşın: nömrə, model, yanacaq növü, sərf, qiymət + Excel düyməsi
export function CarInfo({ car, employeeId, anchor, price, fuelName }: CarInfoProps) {
  const per100 = car.fuel_per_100;
  const details = `${fuelName ?? "yanacaq seçilməyib"} · ${per100 ? `${per100} L / 100 km` : "sərf yazılmayıb"} · ${price ? `${price} ₼ / L` : "qiymət yazılmayıb"}`;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 max-lg:w-full lg:flex-nowrap">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-frost max-sm:h-10 max-sm:w-10 max-sm:rounded-xl"><Fuel size={22} /></span>
      <div className="min-w-0 max-lg:flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-bold">{car.car_plate ? <span className="plate shrink-0">{car.car_plate}</span> : "Maşın"} <span>{car.car_model}</span></p>
        <p className="text-xs text-white/60 max-sm:hidden">{details}</p>
      </div>
      {/* Ustanın öz yanacaq hesabı: seçilmiş ayın Excel faylı (xülasə, gündəlik, ödənişlər, aylar) */}
      <button type="button" onClick={() => void exportFuel(employeeId, anchor.slice(0, 7))} title="Bu ayın yanacaq hesabını Excel fayla çıxar" aria-label="Excel"
        className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 max-lg:ml-auto max-sm:h-9 max-sm:px-2.5 lg:ml-4">
        <FileSpreadsheet size={16} className="text-[#4ade80]" /> <span className="max-sm:hidden">Excel</span>
      </button>
      <p className="basis-full whitespace-nowrap text-[11px] text-white/60 sm:hidden">{details}</p>
    </div>
  );
}
