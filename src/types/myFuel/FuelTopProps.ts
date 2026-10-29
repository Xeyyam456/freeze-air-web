import type { FuelRange, FuelTotals, MileageRow, MonthTotals, Period } from "@/types/fuel";
import type { FuelCarInfo } from "./FuelCarInfo";

export type FuelTopProps = {
  car: FuelCarInfo;
  employeeId: number;
  anchor: string;
  today: string;
  period: Period;
  range: FuelRange;
  monthR: FuelRange;
  atEnd: boolean;
  todayRow: MileageRow | null;
  total: FuelTotals;
  month: MonthTotals;
  balance: number;
  price: number | null;
  fuelName: string | null;
  onPeriod: (p: Period) => void;
  onShift: (dir: 1 | -1) => void;
};
