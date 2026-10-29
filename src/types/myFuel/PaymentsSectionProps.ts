import type { FuelPayment } from "@/types/fuel";

export type PaymentsSectionProps = { label: string; payments: FuelPayment[]; onConfirm: (p: FuelPayment, received: boolean) => void };
