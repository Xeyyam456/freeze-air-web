import type { ClientRecord } from "./ClientRecord";
import type { WorkStub } from "./WorkStub";

export type ClientListRaw = { clients: ClientRecord[]; works: WorkStub[]; groups: Map<number, string> };
