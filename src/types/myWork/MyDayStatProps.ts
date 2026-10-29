import type { LucideIcon } from "lucide-react";

// Kiçik göstərici xanası (link verilsə klik olunur)
export type MyDayStatProps = { icon: LucideIcon; label: string; value: React.ReactNode; sub?: string; href?: string };
