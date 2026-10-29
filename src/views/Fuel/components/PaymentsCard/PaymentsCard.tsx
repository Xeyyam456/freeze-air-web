import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FuelPayment } from "@/types/fuel";
import type { PaymentsCardProps } from "@/types/myFuel";
import { dayName } from "../../shared/dates";
import { azn } from "../../shared/money";
import { PaymentRow } from "../PaymentRow";

const total = (l: FuelPayment[]) => l.reduce((n, p) => n + Number(p.amount), 0);

// "Aldığım yanacaq pulu": ay boyu hər gün ödəniş ola bilər, ona görə yığcam kart: üstdə yekun, gözləyənlər həmişə görünür (təsdiq lazımdır),
// qəbul olunanların son 3-ü; "Hamısına bax" günlərə görə qruplaşmış sürüşən siyahı açır (hər günün başlığında günün cəmi)
export function PaymentsCard({ payments, onConfirm }: PaymentsCardProps) {
  const [open, setOpen] = useState(false);
  const waiting = payments.filter((p) => p.status !== "received");
  const received = payments.filter((p) => p.status === "received");
  const preview = received.slice(0, Math.max(1, 3 - waiting.length));
  const hidden = received.length - preview.length;
  const days = new Map<string, FuelPayment[]>();
  for (const p of received) days.set(p.day, [...(days.get(p.day) ?? []), p]);

  return (
    <div className="card overflow-hidden !p-0">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-[linear-gradient(135deg,#ecfbf1,#ffffff)] px-4 py-3 max-sm:px-3 max-sm:py-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Cəmi aldığın</p>
          <p className="text-2xl font-extrabold tabular-nums leading-tight text-ok max-sm:text-xl">{azn(total(received))}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5 text-xs font-semibold max-sm:text-[11px]">
          <span className="whitespace-nowrap rounded-full bg-bg px-2.5 py-1 text-muted">{payments.length} ödəniş</span>
          {waiting.length > 0 && <span className="whitespace-nowrap rounded-full bg-[#fff6e5] px-2.5 py-1 text-amber-700">{waiting.length} gözləyir · {azn(total(waiting))}</span>}
        </div>
      </div>
      {waiting.length > 0 && (
        <ul className="divide-y divide-line border-b border-line bg-[#fffdf7]">
          {waiting.map((p) => <PaymentRow key={p.id} p={p} onConfirm={(r) => onConfirm(p, r)} />)}
        </ul>
      )}
      {!open ? (
        <ul className="divide-y divide-line">
          {preview.map((p) => <PaymentRow key={p.id} p={p} onConfirm={(r) => onConfirm(p, r)} />)}
        </ul>
      ) : (
        <div className="nice-scroll max-h-[340px] overflow-y-auto">
          {[...days].map(([day, list]) => (
            <div key={day}>
              <p className="sticky top-0 z-10 flex items-center justify-between bg-bg px-4 py-1.5 text-xs font-semibold text-muted max-sm:px-3">
                <span>{dayName(day)}</span><span className="tabular-nums">{list.length > 1 ? `${list.length} ödəniş · ` : ""}{azn(total(list))}</span>
              </p>
              <ul className="divide-y divide-line">{list.map((p) => <PaymentRow key={p.id} p={p} hideDay onConfirm={(r) => onConfirm(p, r)} />)}</ul>
            </div>
          ))}
        </div>
      )}
      {(hidden > 0 || open) && received.length > 0 && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
          className="flex w-full items-center justify-center gap-1.5 border-t border-line bg-[#f8fafc] py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft/40">
          {open ? "Yığ" : `Hamısına bax (${received.length})`}
          <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
