import { AlertTriangle, Check, HandCoins, X } from "lucide-react";
import type { PaymentRowProps } from "@/types/myFuel";
import { dayName } from "../../shared/dates";
import { azn } from "../../shared/money";
import { Button } from "@/shared/components/Button";

// Ödəniş: məbləğ, tarix, qeyd; "Aldım" / "Almadım" (fuel_payment_confirm). Cavab dəyişdirilə bilər.
export function PaymentRow({ p, onConfirm, hideDay = false }: PaymentRowProps) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 max-sm:gap-x-2 max-sm:gap-y-2 max-sm:px-3 max-sm:py-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary max-sm:hidden"><HandCoins size={17} /></span>
      <span className="min-w-0 flex-[1_1_160px]">
        <span className="block font-bold tabular-nums"><span className="whitespace-nowrap">{azn(Number(p.amount))}</span> {!hideDay && <span className="muted whitespace-nowrap text-xs font-semibold">· {dayName(p.day)}</span>}</span>
        {p.note && <span className="muted line-clamp-2 text-xs max-sm:line-clamp-1" title={p.note}>{p.note}</span>}
      </span>
      {p.status === "received" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2.5 py-1 text-xs font-bold text-ok"><Check size={13} strokeWidth={3} /> Aldım</span>
      ) : p.status === "disputed" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-1 text-xs font-bold text-danger"><AlertTriangle size={13} /> Almadım</span>
      ) : null}
      {/* "Aldım" təsdiqindən sonra cavab dəyişmir (bazada da: 0081); "Almadım"dan sonra "Aldım" olar */}
      {p.status !== "received" && (
        // Telefonda düymələr alt sətirdə, bərabər enli
        <span className="flex gap-1.5 max-sm:w-full max-sm:[&>button]:!h-8 max-sm:[&>button]:flex-1">
          <Button type="button" onClick={() => onConfirm(true)} variant="plain" size="sm" className="bg-ok text-white hover:brightness-110"><Check size={14} /> Aldım</Button>
          {p.status !== "disputed" && (
            <Button type="button" onClick={() => onConfirm(false)} variant="soft" size="sm" className="text-danger"><X size={14} /> Almadım</Button>
          )}
        </span>
      )}
    </li>
  );
}
