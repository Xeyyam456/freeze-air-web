import type { PaletteItem } from "./PaletteItem";

export type CommandRowProps = { item: PaletteItem; index: number; current: boolean; head: string | null; onHover: (i: number) => void };
