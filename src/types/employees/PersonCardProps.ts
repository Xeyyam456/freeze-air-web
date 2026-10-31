import type { Employee } from "./Employee";
import type { PersonStat } from "./PersonStat";
import type { PersonStatus } from "./PersonStatus";

export type PersonCardProps = {
  person: Employee;
  subtitle: string;
  badge?: string;
  highlight?: boolean;
  status?: PersonStatus;
  stats?: PersonStat[];
  onOpen: () => void;
};
