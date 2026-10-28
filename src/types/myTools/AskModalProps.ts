import type { Tool } from "@/types/depot";
import type { Kind } from "@/types/depot";

export type AskModalProps = { stock: Tool[]; pendingIds: Set<number>; initialKind: Kind; onClose: () => void };
