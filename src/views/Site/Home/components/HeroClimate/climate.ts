import type { HeroClimate } from "@/types/site";

export const AWAY = -1e4;
export const MIN_TEMP = 16;
export const MAX_TEMP = 30;
export const BASE_TEMP = 22;

// Canvas-ların hər kadrda oxuduğu ortaq vəziyyət
export const climate: HeroClimate = { warm: 0, frost: 0, px: AWAY, py: AWAY, glow: 0, density: 1, drops: 1 };

const clamp = (v: number) => Math.min(1, Math.max(0, v));

// Temperatur → istilik/şaxta (22° = hazırkı görünüş). Həmçinin: 25°-dən yuxarı günəş (--sun), 20°-dən aşağı
// soyuq hava (--cold); onlar damcıları əvəz edir. Hamısı canvas-lara və CSS dəyişənlərinə (overlay-lər) yazılır.
export function applyTemp(temp: number, host: HTMLElement | null) {
  const sun = clamp((temp - 24) / 3);
  const cold = clamp((21 - temp) / 3);
  climate.warm = clamp((temp - BASE_TEMP) / (MAX_TEMP - BASE_TEMP));
  climate.frost = clamp((BASE_TEMP - temp) / (BASE_TEMP - MIN_TEMP));
  climate.drops = 1 - Math.max(sun, cold);
  host?.style.setProperty("--warm", String(climate.warm));
  host?.style.setProperty("--frost", String(climate.frost));
  host?.style.setProperty("--sun", String(sun));
  host?.style.setProperty("--cold", String(cold));
}
