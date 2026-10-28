import type { Tool } from "@/types/depot";

export type Mine = {
  id: number; tool_id: number; quantity: number; taken_at: string; received_at: string | null; disputed_at: string | null;
  tools: Pick<Tool, "name" | "kind" | "unit" | "pack_name" | "pack_size"> | null;
};
