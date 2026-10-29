import type { sum } from "@/views/Fuel/shared/money";

// Bağlanmış günlərin cəmi: km, litr, məbləğ, gün sayı
export type FuelTotals = ReturnType<typeof sum>;
