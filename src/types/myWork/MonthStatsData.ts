import type { MonthLog } from "./MonthLog";

// key: "il-ay" (köhnə ay yeni gələnə qədər qalır); prevCount: əvvəlki ayın tam iş sayı
export type MonthStatsData = { key: string; logs: MonthLog[]; prevCount: number };
