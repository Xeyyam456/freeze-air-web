import { HandCoins } from "lucide-react";
import type { PaymentsSectionProps } from "@/types/myFuel";
import { PaymentsCard } from "../PaymentsCard";

// Şirkətin verdiyi yanacaq pulu: hər ödənişi təsdiqlə
export function PaymentsSection({ label, payments, onConfirm }: PaymentsSectionProps) {
  const pending = payments.filter((p) => p.status === "pending").length;
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
        <HandCoins size={18} className="text-primary" /> <span>Aldığım yanacaq pulu<span className="max-sm:hidden"> · {label}</span></span>
        {pending > 0 && <span className="whitespace-nowrap rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">{pending} təsdiq gözləyir</span>}
      </h2>
      {payments.length === 0 ? (
        <p className="card muted py-6 text-center text-sm">Bu dövrdə şirkət yanacaq pulu verməyib.</p>
      ) : (
        <PaymentsCard payments={payments} onConfirm={onConfirm} />
      )}
    </section>
  );
}
