import type { MyTask } from "./MyTask";

// done: qrupda bütün üzvlər görübsə; showNext: "→ yeni usta" (tək tapşırıqda)
export type TeamTaskLineProps = { t: MyTask; cancelled: boolean; done: boolean; showNext: boolean; logId: number | null; onViewLog: (logId: number) => void };
