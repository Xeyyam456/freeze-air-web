import type { ClientRecord } from "./ClientRecord";

export type ClientRow = ClientRecord & { units: number; coords: number; works: number };
