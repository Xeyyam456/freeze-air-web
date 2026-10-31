import type { LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; hint: string; tasks?: boolean; depot?: boolean; fuel?: boolean };
