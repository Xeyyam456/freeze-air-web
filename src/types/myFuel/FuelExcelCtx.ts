import type { ExcelBalance } from "./ExcelBalance";
import type { ExcelEmployee } from "./ExcelEmployee";
import type { ExcelLog } from "./ExcelLog";
import type { ExcelPay } from "./ExcelPay";
import type { ExcelTotals } from "./ExcelTotals";

// Yanacaq Excel-inin hesablanmış konteksti: il/ayın yürüşləri və ödənişləri, ayın günləri, yekunlar, balans, başlıq sətirləri
export type FuelExcelCtx = {
  employeeId: number;
  month: string;
  year: string;
  m: number;
  today: string;
  name: string;
  emp: ExcelEmployee | null;
  logs: ExcelLog[];
  pays: ExcelPay[];
  days: string[];
  first: string;
  lastDay: string;
  monthLogs: ExcelLog[];
  monthPays: ExcelPay[];
  logOf: Map<string, ExcelLog>;
  paidOn: (day: string) => number;
  workdaysAll: number;
  T: ExcelTotals;
  balance: number;
  waiting: number;
  label: string;
  bal: ExcelBalance;
  car: string;
  carLine: string;
  made: string;
  lastLog: ExcelLog | undefined;
  dayT: ExcelTotals;
};
