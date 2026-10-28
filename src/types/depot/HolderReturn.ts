import type { useHolderReturn } from "@/views/Depot/hooks/useHolderReturn";

// Ustadakını geri alma / təhvil vəziyyəti (HolderRow → SettleForm)
export type HolderReturn = ReturnType<typeof useHolderReturn>;
