import type { Kind } from "@/lib/kinds";
import type { UnitFilter } from "./UnitFilter";

export type UnitSearchProps = {
  kind: Kind;
  query: string;
  onQuery: (q: string) => void;
  filter: UnitFilter;
  onFilter: (f: UnitFilter) => void;
  total: number;
  noCoords: number;
};
