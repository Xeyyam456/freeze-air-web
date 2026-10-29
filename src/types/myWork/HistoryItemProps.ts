import type { HistoryRow } from "./HistoryRow";

// showStore: şirkətin tarixçəsində hansı filial olduğu da yazılır
export type HistoryItemProps = { r: HistoryRow; showStore: boolean; onOpen: (id: number) => void };
