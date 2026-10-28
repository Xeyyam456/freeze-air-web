import type { Held } from "@/types/myTools/Held";

export type Person = { id: number; name: string; photo: string | null; items: Held[] };
