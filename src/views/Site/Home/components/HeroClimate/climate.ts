import type { HeroClimate } from "@/types/site";

export const AWAY = -1e4;
export const MIN_TEMP = 16;
export const MAX_TEMP = 30;
export const BASE_TEMP = 22;

// Canvas-ların hər kadrda oxuduğu ortaq vəziyyət
export const climate: HeroClimate = { warm: 0, frost: 0, px: AWAY, py: AWAY, glow: 0, density: 1 };

const clamp = (v: number) => Math.min(1, Math.max(0, v));

// Temperatur → istilik/şaxta (22° = hazırkı görünüş); həm canvas-lara, həm CSS dəyişənlərinə (overlay-lər) yazılır
export function applyTemp(temp: number, host: HTMLElement | null) {
  climate.warm = clamp((temp - BASE_TEMP) / (MAX_TEMP - BASE_TEMP));
  climate.frost = clamp((BASE_TEMP - temp) / (BASE_TEMP - MIN_TEMP));
  host?.style.setProperty("--warm", String(climate.warm));
  host?.style.setProperty("--frost", String(climate.frost));
}
