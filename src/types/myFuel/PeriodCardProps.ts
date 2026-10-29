import type { FuelRange, FuelTotals, MonthTotals, Period } from "@/types/fuel";

export type PeriodCardProps = { period: Period; range: FuelRange; monthR: FuelRange; total: FuelTotals; month: MonthTotals; balance: number };
