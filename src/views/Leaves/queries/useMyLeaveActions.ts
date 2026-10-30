import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import { cancelLeave, giveUpLeave } from "@/services/leaves/leaveRequests";
import { ATTENDANCE_KEYS } from "@/shared/utils/attendance/constants";
import { RECENT_LEAVES_KEY } from "./keys";

// Ustanın öz sorğuları: "Ehtiyac qalmadı" və "Geri götür" (tost + keşin yenilənməsi)
export function useMyLeaveActions() {
  const reload = () => revalidate(...ATTENDANCE_KEYS, RECENT_LEAVES_KEY);

  async function giveUp(id: number) {
    const error = await giveUpLeave(id);
    if (error) return toast.error(error.message);
    toast.success("İcazə ləğv edildi", "İşə gələ bilərsən");
    reload();
  }

  async function cancel(id: number) {
    const error = await cancelLeave(id);
    if (error) return toast.error(error.message);
    toast.success("Sorğu geri götürüldü");
    reload();
  }

  return { giveUp, cancel, reload };
}
