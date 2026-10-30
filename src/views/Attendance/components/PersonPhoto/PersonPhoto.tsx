import { initials } from "@/lib/experience";
import type { PersonPhotoProps } from "@/types/attendance";

// Ustanın şəkli, yoxdursa baş hərflər (ölçü className ilə)
export function PersonPhoto({ employee, className }: PersonPhotoProps) {
  if (!employee.photo_url) {
    return <span className={`${className} grid shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary`}>{initials(employee.full_name)}</span>;
  }
  // eslint-disable-next-line @next/next/no-img-element -- storage avatarı
  return <img src={employee.photo_url} alt={employee.full_name} className={`${className} shrink-0 rounded-full object-cover`} />;
}
