import type { BalanceTone } from "@/types/fuel";
import { azn } from "../shared/money";

// Balans = alınan − sərf: mənfi → şirkət sənə borcludur, müsbət → artıq almısan
export function balanceText(b: number): { tone: BalanceTone; text: string } {
  const v = Math.round(b * 100) / 100;
  if (v < 0) return { tone: "debt", text: `Şirkət sənə ${azn(-v)} borcludur` };
  if (v > 0) return { tone: "over", text: `${azn(v)} artıq almısan` };
  return { tone: "even", text: "Hesab bağlıdır" };
}
