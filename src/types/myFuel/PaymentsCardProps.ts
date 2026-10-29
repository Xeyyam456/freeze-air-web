import type { FuelPayment } from "@/types/fuel";

export type PaymentsCardProps = { payments: FuelPayment[]; onConfirm: (p: FuelPayment, received: boolean) => void };
