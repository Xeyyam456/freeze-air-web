import type { MonthSummary } from "./MonthSummary";

export type HeroTopProps = {
  y: number;
  m: number;
  stats: MonthSummary;
  loaded: boolean;
  diff: number;
  isCurrent: boolean;
  todayD: number;
  days: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};
