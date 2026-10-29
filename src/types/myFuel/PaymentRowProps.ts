import type { FuelPayment } from "@/types/fuel";

export type PaymentRowProps = { p: FuelPayment; onConfirm: (received: boolean) => void; hideDay?: boolean };
