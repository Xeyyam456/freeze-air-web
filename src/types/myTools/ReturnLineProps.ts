import type { Mine } from "./Mine";
import type { Draft } from "./Draft";

export type ReturnLineProps = { h: Mine; d: Draft; onChange: (d: Draft) => void; employeeId: number };
