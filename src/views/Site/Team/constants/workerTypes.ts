import { HardHat, Truck, Wrench, type LucideIcon } from "lucide-react";
import type { WorkerKind } from "@/types/site";

// İş növləri (bazada employees.worker_type); adları saytın mətnlərindən: team.type.*
export const WORKER_TYPES: { key: WorkerKind; icon: LucideIcon }[] = [
  { key: "master", icon: Wrench },
  { key: "assistant", icon: HardHat },
  { key: "driver", icon: Truck },
];

export const typeKey = (type: string) => `team.type.${(WORKER_TYPES.find((ty) => ty.key === type) ?? WORKER_TYPES[0]).key}` as const;
