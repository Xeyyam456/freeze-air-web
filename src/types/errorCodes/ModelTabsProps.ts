import type { ErrorModel } from "./ErrorModel";

export type ModelTabsProps = { models: ErrorModel[]; counts: Map<number, number>; value: number | null; onChange: (id: number) => void };
