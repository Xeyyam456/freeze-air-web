import { HardHat, Truck, Wrench, type LucideIcon } from "lucide-react";
import type { WorkerKind } from "@/types/site";
import { tone } from "@/components/landing/tones";

// İş növləri (bazada employees.worker_type); adları saytın mətnlərindən: team.type.*
export const WORKER_TYPES: { key: WorkerKind; icon: LucideIcon }[] = [
  { key: "master", icon: Wrench },
  { key: "assistant", icon: HardHat },
  { key: "driver", icon: Truck },
];

// İş növünün rəngi (tones.ts): usta firuzəyi, köməkçi narıncı, sürücü yaşıl
const TYPE_TONE: Record<string, number> = { master: 0, assistant: 3, driver: 2 };
export const typeTone = (type: string) => tone(TYPE_TONE[type] ?? 0);

export const typeKey = (type: string) => `team.type.${(WORKER_TYPES.find((ty) => ty.key === type) ?? WORKER_TYPES[0]).key}` as const;
