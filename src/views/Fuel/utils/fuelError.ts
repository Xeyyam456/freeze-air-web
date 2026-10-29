import type { StepKind } from "@/types/myFuel";

// Bazanın ingiliscə xətalarını başa düşülən Azərbaycan dilinə çevirir
export function fuelError(msg: string, kind: StepKind) {
  if (/mileage_logs_check/.test(msg)) return kind === "start" ? "Səhər km axşam km-dən çox ola bilməz." : "Axşam km səhər km-dən az ola bilməz.";
  if (/mileage_logs_(start|end)_km_check/.test(msg)) return "Km mənfi ola bilməz.";
  if (/mileage_logs_employee_id_day_key|duplicate key/.test(msg)) return "Bu gün üçün qeyd artıq var, səhifəni yenilə.";
  if (/row-level security|permission denied/.test(msg)) return "Bu əməliyyata icazən yoxdur.";
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return "İnternet bağlantısı yoxdur, yenidən yoxla.";
  return msg;
}
