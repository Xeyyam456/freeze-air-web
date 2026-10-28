import type { Tone } from "@/types/depot";

export const STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Gözləyir", tone: "amber" },
  approved: { label: "Qəbul edildi", tone: "green" },
  rejected: { label: "Rədd edildi", tone: "red" },
  cancelled: { label: "Ləğv olundu", tone: "slate" },
};
