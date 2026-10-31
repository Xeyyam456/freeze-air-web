import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/me";
import { revalidate } from "@/lib/revalidate";
import { useData } from "@/lib/useData";
import { deleteEmployeeLog, fetchEmployeeLogs } from "@/services/myWork/employeeLogs";
import type { EmployeeLog } from "@/types/myWork";

// Yerli tarix "YYYY-MM-DD"; offset gün qədər irəli/geri (dünən: -1)
export function dayIso(offset = 0, from?: string) {
  const d = from ? new Date(`${from}T12:00:00`) : new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Ustanın işlər tabının vəziyyəti: gün, işlər (keşdə), kimin nə edə biləcəyi, silmə
export function useWorkTab(employeeId: number) {
  // Standart olaraq bu günün işləri; dünən və daha əvvəlki günləri seçmək olur
  const [day, setDay] = useState(() => dayIso());
  // Keşdə (fayl linkləri 1 saatlıqdır, keş ən çox 10 dəq. saxlayır): pəncərəni təkrar açanda dərhal görünür
  const logs = useData("work-tab", () => fetchEmployeeLogs(employeeId, day), [employeeId, day]);
  const myEmployeeId = useMe()?.id ?? null;
  const router = useRouter();

  // İş dəyişəndə həm bu siyahı, həm də kartdakı "bu gün" sayı yenilənir
  const load = () => {
    revalidate("work-tab", "my-day-stats", "work-history", "month-stats");
    router.refresh();
  };

  const today = dayIso();
  function changeDay(value: string) {
    if (!value || value > today) return;
    setDay(value); // yeni gün gələnə qədər köhnə günün siyahısı qalır
  }

  async function remove(log: EmployeeLog) {
    await deleteEmployeeLog(log);
    load();
  }

  // Hər kəs baxır; iş əlavə etmək, dəyişmək və silmək yalnız ustanın özünə aiddir
  return { day, logs, today, yesterday: dayIso(-1), load, changeDay, remove, canAdd: myEmployeeId === employeeId, isMine: (log: EmployeeLog) => myEmployeeId === log.employee_id };
}
