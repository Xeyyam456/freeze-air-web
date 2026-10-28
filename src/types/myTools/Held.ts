import type { Tool } from "@/types/depot";

export type Held = {
  id: number; tool_id: number; employee_id: number; quantity: number; taken_at: string;
  employees: { full_name: string; photo_url: string | null } | null;
  tools: Pick<Tool, "name" | "kind" | "unit" | "pack_name" | "pack_size"> | null;
};
