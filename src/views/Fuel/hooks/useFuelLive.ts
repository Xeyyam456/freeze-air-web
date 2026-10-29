import { useEffect } from "react";
import { toast } from "@/lib/toast";
import { subscribeMyFuel } from "@/services/myFuel/live";
import { azn } from "../shared/money";

// Canlı (0080-0082): şirkət pul verəndə / dəyişəndə və admin yürüşü düzəldəndə səhifə özü yenilənir; yeni ödənişdə tost
export function useFuelLive(employeeId: number, load: () => Promise<unknown>) {
  useEffect(() => subscribeMyFuel(employeeId, (p) => {
    void load();
    if (p) toast.success(`Şirkət yanacaq pulu verdi: ${azn(Number(p.amount))}`, "«Aldım» ilə təsdiqlə");
  }, () => void load()), [employeeId, load]);
}
