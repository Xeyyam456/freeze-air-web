import type { FuelPayment, FuelRange, FuelTotals, MileageRow, Period } from "@/types/fuel";

export type DailySectionProps = { rows: MileageRow[]; payments: FuelPayment[]; total: FuelTotals; paid: number; period: Period; range: FuelRange; today: string };
