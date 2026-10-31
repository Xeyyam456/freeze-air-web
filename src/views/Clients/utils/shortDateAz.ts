import { MONTHS_AZ } from "@/shared/utils/monthsAz";

// "2026-10-07" → "7 Oktyabr"
export function shortDateAz(iso: string) {
  return `${Number(iso.slice(8, 10))} ${MONTHS_AZ[Number(iso.slice(5, 7)) - 1]}`;
}
