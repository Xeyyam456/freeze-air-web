import type { LucideIcon } from "lucide-react";

export type PaletteItem = { key: string; group: string; label: string; hint?: string; icon: LucideIcon; run: () => void };
