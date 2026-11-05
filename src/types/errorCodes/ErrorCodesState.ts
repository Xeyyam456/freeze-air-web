import type { CodeTwin } from "./CodeTwin";
import type { ErrorCode } from "./ErrorCode";
import type { ErrorModel } from "./ErrorModel";

export type ErrorCodesState = {
  models: ErrorModel[];
  counts: Map<number, number>;
  modelId: number | null;
  modelName: string;
  setModelId: (id: number) => void;
  query: string;
  setQuery: (q: string) => void;
  codes: ErrorCode[];
  matches: Set<number> | null;
  results: ErrorCode[] | null;
  selected: ErrorCode | null;
  twins: CodeTwin[];
  prev: ErrorCode | null;
  next: ErrorCode | null;
  display: string;
  select: (c: ErrorCode) => void;
};
