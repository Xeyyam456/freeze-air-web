import { Briefcase, CalendarDays, Car, Phone } from "lucide-react";
import { experience } from "@/lib/experience";
import { InfoCell } from "@/shared/components/InfoCell";
import { formatDate } from "@/shared/utils/formatDate";
import type { EmployeeProps } from "@/types/employees";

// "Haqqında" tabı: təcrübə, başlama tarixi, telefon, maşın
export function AboutTab({ employee }: EmployeeProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <InfoCell icon={Briefcase} label="Təcrübə"><p className="font-semibold">{experience(employee.start_date) ?? "—"}</p></InfoCell>
      <InfoCell icon={CalendarDays} label="İşə başlayıb"><p className="font-semibold">{formatDate(employee.start_date) ?? "—"}</p></InfoCell>
      <InfoCell icon={Phone} label="Telefon">
        {employee.phone
          ? <a href={`tel:${employee.phone}`} className="link whitespace-nowrap max-[400px]:text-xs">{employee.phone}</a>
          : <p className="font-semibold">—</p>}
      </InfoCell>
      {/* Maşın (0076): admin paneldə yazılır */}
      <InfoCell icon={Car} label="Maşın">
        {employee.has_car
          ? <p className="font-semibold"><span className="plate">{employee.car_plate ?? "Nömrə yazılmayıb"}</span>{employee.car_model && <span className="muted ml-1.5 text-xs font-medium">{employee.car_model}</span>}</p>
          : <p className="muted font-semibold">Yoxdur</p>}
      </InfoCell>
    </div>
  );
}
