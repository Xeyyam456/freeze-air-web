import type { HeldMaterial } from "./HeldMaterial";

export type MaterialsUsedProps = { held: HeldMaterial[]; used: Record<number, string>; onUse: (toolId: number, value: string) => void };
