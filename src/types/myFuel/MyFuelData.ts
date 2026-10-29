import type { FuelPayment, FuelPrices, MileageRow, MonthTotals } from "@/types/fuel";

// Dövrün yürüşləri, bu günün sətri, qiymətlər, dövrün ödənişləri və ayın cəmi (aylıq balans)
export type MyFuelData = { rows: MileageRow[]; today: MileageRow | null; prices: FuelPrices; payments: FuelPayment[]; month: MonthTotals };
