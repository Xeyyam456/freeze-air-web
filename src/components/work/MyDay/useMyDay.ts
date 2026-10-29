import { useState } from "react";
import { timeBaku, useMonthAttendance } from "@/lib/attendance";
import { useMe } from "@/lib/me";
import { toast } from "@/lib/toast";
import { useData } from "@/lib/useData";
import { cancelTodayLeave, checkIn, checkOut, fetchMyDayStats } from "@/services/myWork/myDay";

// Mənim bugünüm: kim, göstəricilər (keşdə), bu günün davamiyyəti (Realtime), işə gəlmə / bitirmə / icazədən imtina
export function useMyDay() {
  // undefined = yüklənir, null = əməkdaş kartı yoxdur
  const me = useMe();
  // Keşdə: iş yazılanda və tapşırıq dəyişəndə QueryProvider "my-day-stats"-ı yeniləyir
  const stats = useData("my-day-stats", () => (me ? fetchMyDayStats(me.id) : Promise.resolve(null)), [me?.id]);
  const [checking, setChecking] = useState(false);
  const attendance = useMonthAttendance(); // bu günün vəziyyəti Realtime ilə
  const mine = me && attendance ? attendance.byEmployee.get(me.id) ?? attendance.empty : null;

  async function onCheckIn() {
    setChecking(true);
    const { time, error } = await checkIn();
    setChecking(false);
    if (error) return toast.error(error);
    toast.success("İşə gəldin", time ? `Başlama saatı: ${timeBaku(time)}` : undefined);
  }

  // İcazəli gündə icazəyə ehtiyac qalmadı: bugünkü icazə ləğv olunur (leave_cancel) və işə gəlmə yazılır
  async function onGiveUpLeave() {
    if (!me) return;
    setChecking(true);
    const cancelError = await cancelTodayLeave(me.id);
    if (cancelError) {
      setChecking(false);
      return toast.error(cancelError);
    }
    const { time, error } = await checkIn();
    setChecking(false);
    if (error) return toast.error(error);
    toast.success("İcazə ləğv edildi, işə gəldin", time ? `Başlama saatı: ${timeBaku(time)}` : undefined);
  }

  // Axşam: "İşi bitirdim" (bitmə saatı yazılır, gündə bir dəfə)
  async function onCheckOut() {
    setChecking(true);
    const { time, error } = await checkOut();
    setChecking(false);
    if (error) return toast.error(error);
    toast.success("İş günü bitdi", time ? `Bitmə saatı: ${timeBaku(time)}` : undefined);
  }

  return { me, stats, checking, mine, onCheckIn, onGiveUpLeave, onCheckOut };
}
