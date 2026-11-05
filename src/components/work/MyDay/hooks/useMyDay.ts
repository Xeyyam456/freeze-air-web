import { useState } from "react";
import { useMonthAttendance } from "@/shared/hooks/useMonthAttendance";
import { ATTENDANCE_KEYS } from "@/shared/utils/attendance/constants";
import { timeBaku } from "@/shared/utils/timeBaku";
import { useMe } from "@/lib/me";
import { revalidate } from "@/lib/revalidate";
import { toast } from "@/lib/toast";
import type { AttendanceCall, OptimisticDay, TodayAttendance } from "@/types/myWork";
import { cancelTodayLeave, checkIn, checkOut } from "@/services/myWork/myDay";
import { checkedIn, checkedOut } from "../utils/optimisticDay";

// Mənim bugünüm: kim, bu günün davamiyyəti (Realtime), işə gəlmə / bitirmə / icazədən imtina.
// Optimistik: düymə basılan an vəziyyət dəyişir ("İşdəsən · 09:41-dən"); bazanın cavabından sonra keş dərhal yenilənir
// (Realtime gözlənilmir), təzə məlumat gələndə optimistik vəziyyət öz-özünə düşür; xətada geri qayıdır.
export function useMyDay() {
  const me = useMe(); // undefined = yüklənir, null = əməkdaş kartı yoxdur
  const [checking, setChecking] = useState(false);
  const attendance = useMonthAttendance(); // bu günün vəziyyəti Realtime ilə
  const real = me && attendance ? attendance.byEmployee.get(me.id) ?? attendance.empty : null;
  // base: optimistik vəziyyət hansı real vəziyyətin üstündə qurulub; real dəyişəndə (təzə məlumat) optimistik düşür
  const [opt, setOpt] = useState<OptimisticDay | null>(null);
  // Yazma bitənə qədər (checking) başqa ustanın canlı hadisəsi köhnə məlumat gətirsə də optimistik vəziyyət qalır
  const today = opt && (checking || opt.base === real?.today) ? opt.day : real?.today;
  const mine = real ? { ...real, today: today ?? real.today } : null;

  async function run(next: TodayAttendance | undefined, call: AttendanceCall, done: string) {
    setOpt({ base: real?.today, day: next });
    setChecking(true);
    const { time, error } = await call();
    setChecking(false);
    if (error) {
      setOpt(null);
      return toast.error(error);
    }
    revalidate(...ATTENDANCE_KEYS);
    toast.success(done, time ? `Saat: ${timeBaku(time)}` : undefined);
  }

  const now = () => new Date().toISOString();
  const onCheckIn = () => run(checkedIn(real?.today, now()), checkIn, "İşə gəldin");
  const onCheckOut = () => run(checkedOut(real?.today, now()), checkOut, "İş günü bitdi");

  // İcazəli gündə icazəyə ehtiyac qalmadı: bugünkü icazə ləğv olunur (leave_cancel) və işə gəlmə yazılır
  const onGiveUpLeave = () => run(checkedIn(real?.today, now()), async () => {
    if (!me) return { time: null, error: null };
    const cancelError = await cancelTodayLeave(me.id);
    return cancelError ? { time: null, error: cancelError } : checkIn();
  }, "İcazə ləğv edildi, işə gəldin");

  return { me, checking, mine, onCheckIn, onGiveUpLeave, onCheckOut };
}
