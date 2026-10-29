import { ListChecks } from "lucide-react";
import { formatDateAz } from "@/components/DatePicker";
import type { EmptyDayProps } from "@/types/myTasks";

export function EmptyDay({ day, today }: EmptyDayProps) {
  return (
    <div className="card py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary-soft to-[#e6f8fc] text-primary">
        <ListChecks size={28} />
      </span>
      <p className="mt-4 text-lg font-bold">{day === today ? "Bu gün" : formatDateAz(day)} üçün tapşırıq yoxdur</p>
      <p className="muted mt-1 text-sm">Tapşırıqları admin və rəhbərlik verir. Yeni tapşırıq gələndə burada dərhal görünəcək.</p>
    </div>
  );
}
