import type { UnitFilter } from "./UnitFilter";
import type { Kind } from "@/types/clients";

export type UnitSearchProps = {
  kind: Kind;
  query: string;
  onQuery: (q: string) => void;
  filter: UnitFilter;
  onFilter: (f: UnitFilter) => void;
  total: number;
  noCoords: number;
};
