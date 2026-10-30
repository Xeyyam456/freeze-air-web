import { useState } from "react";
import { toast } from "@/lib/toast";
import { submitLeave } from "@/services/leaves/leaveRequests";
import { leaveWorkdays } from "@/shared/utils/attendance/leaveWorkdays";
import { todayBaku } from "@/shared/utils/todayBaku";
import { useMyLeaveActions } from "../queries/useMyLeaveActions";

// İcazə istə formu: tarix aralığı (bitmə başlanğıcdan əvvəl ola bilməz), səbəb, iş günü sayı; bazar günləri sayılmır
export function useLeaveForm(employeeId: number) {
  const today = todayBaku();
  const { reload } = useMyLeaveActions();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const end = to < from ? from : to;
  const days = leaveWorkdays({ date_from: from, date_to: end });

  function changeFrom(v: string | null) {
    if (!v) return;
    setFrom(v);
    if (to < v) setTo(v);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (days === 0) return toast.error("Seçilən günlər bazardır: iş günü deyil.");
    setPending(true);
    const error = await submitLeave(employeeId, from, end, reason);
    setPending(false);
    if (error) return toast.error(error.message);
    toast.success("İcazə sorğusu göndərildi", "Admin təsdiqləyəndə xəbər tutacaqsan");
    setReason("");
    reload();
  }

  return { from, end, reason, setReason, setTo, changeFrom, days, pending, submit };
}
