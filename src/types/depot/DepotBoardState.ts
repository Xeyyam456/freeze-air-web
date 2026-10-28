import type { useDepotBoard } from "@/views/Depot/hooks/useDepotBoard";

// Depo lövhəsinin hesablanmış vəziyyəti (DepotBoard → BoardHome, BoardHeader, cədvəllər)
export type DepotBoardState = ReturnType<typeof useDepotBoard>;
