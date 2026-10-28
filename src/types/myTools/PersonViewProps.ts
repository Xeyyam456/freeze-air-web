import type { Person } from "./Person";

export type PersonViewProps = { p: Person; me: number; onClose: () => void };
