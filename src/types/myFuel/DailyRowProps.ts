import type { MileageRow } from "@/types/fuel";

// got: həmin gün alınan pul; maxKm: zolağın miqyası
export type DailyRowProps = { r: MileageRow; got: number; maxKm: number; today: string };
