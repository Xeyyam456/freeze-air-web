import { initials } from "@/lib/experience";
import type { AvatarProps } from "@/types/employees";

// Şəkil varsa şəkil, yoxdursa baş hərflər
export function Avatar({ employee, className = "" }: AvatarProps) {
  if (employee.photo_url) {
    // eslint-disable-next-line @next/next/no-img-element -- xarici avatar (SVG), optimizasiyaya ehtiyac yoxdur
    return <img src={employee.photo_url} alt={employee.full_name} className={`emp-avatar object-cover ${className}`} />;
  }
  return <span className={`emp-avatar ${className}`}>{initials(employee.full_name)}</span>;
}
