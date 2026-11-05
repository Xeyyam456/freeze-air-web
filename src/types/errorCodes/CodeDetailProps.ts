import type { CodeTwin } from "./CodeTwin";
import type { ErrorCode } from "./ErrorCode";

export type CodeDetailProps = {
  code: ErrorCode | null;
  modelName: string;
  twins: CodeTwin[];
  prev: ErrorCode | null;
  next: ErrorCode | null;
  onSelect: (c: ErrorCode) => void;
};
