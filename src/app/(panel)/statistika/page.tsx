import { redirect } from "next/navigation";

// Statistika Panelə birləşdirilib (2026-11-05): köhnə link və əlfəcinlər Panelə aparır
export default function StatsPage() {
  redirect("/panel");
}
