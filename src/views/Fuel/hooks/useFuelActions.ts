import { toast } from "@/lib/toast";
import { saveMileage, uploadMileagePhoto } from "@/services/myFuel/mileage";
import { confirmPayment } from "@/services/myFuel/payments";
import type { FuelPayment, MileageRow } from "@/types/fuel";
import type { StepKind } from "@/types/myFuel";
import { fuelError } from "../utils/fuelError";
import { toWebp } from "../utils/toWebp";

// Yazı əməliyyatları: səhər/axşam km (+ şəkil) və ödənişə cavab; sonra keş təzələnənə qədər gözlənilir
export function useFuelActions(employeeId: number, today: string, todayRow: MileageRow | null, load: () => Promise<unknown>) {
  async function save(kind: StepKind, km: number, file: File | null) {
    try {
      const photo = file ? await uploadMileagePhoto(employeeId, today, kind, await toWebp(file)) : null;
      const error = await saveMileage(employeeId, kind, km, photo, todayRow?.id ?? null);
      if (error) throw new Error(fuelError(error, kind));
      toast.success(kind === "start" ? "Səhər km-i yazıldı" : "Axşam km-i yazıldı, gün hesablandı");
      await load();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Alınmadı");
      return false;
    }
  }

  async function confirm(p: FuelPayment, received: boolean) {
    const error = await confirmPayment(p.id, received);
    if (error) return toast.error(error);
    toast.success(received ? "Təsdiqlədin: pulu aldın" : "Bildirdin: pulu almamısan", received ? undefined : "Admin görəcək");
    await load();
  }

  return { save, confirm };
}
