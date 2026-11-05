import type { ErrorCode } from "./ErrorCode";

export type CodeMatrixProps = { codes: ErrorCode[]; selectedId: number | null; matches: Set<number> | null; onSelect: (c: ErrorCode) => void };
