import { useCallback } from "react";
import { getQueryClient } from "@/lib/queryClient";
import { useData } from "@/lib/useData";
import { fetchMyFuel } from "@/services/myFuel/fetchMyFuel";
import { MY_FUEL_KEY } from "./keys";

// Keşdə: dövr dəyişəndə köhnə dövr yeni gələnə qədər qalır, səhifəyə qayıdanda dərhal görünür
export const useMyFuelData = (employeeId: number, from: string, to: string, today: string, mFrom: string, mTo: string) =>
  useData(MY_FUEL_KEY, () => fetchMyFuel(employeeId, from, to, today, mFrom, mTo), [employeeId, from, to, today, mFrom, mTo]);

// Yazıdan / canlı hadisədən sonra: keş təzələnənə qədər gözlənilir (km yazıb dərhal yeni rəqəmi görmək üçün)
export const useMyFuelReload = () => useCallback(() => getQueryClient().invalidateQueries({ queryKey: [MY_FUEL_KEY] }), []);
