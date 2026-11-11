import type { HeroClimate } from "@/types/site";

export const AWAY = -1e4;
export const MIN_TEMP = 16;
export const MAX_TEMP = 30;
export const BASE_TEMP = 22;

// Canvas-ların hər kadrda oxuduğu ortaq vəziyyət
export const climate: HeroClimate = { warm: 0, frost: 0, px: AWAY, py: AWAY, glow: 0, density: 1, drops: 1, cold: 0 };

const clamp = (v: number) => Math.min(1, Math.max(0, v));

const ramp = (v: number, from: number, to: number) => clamp((v - from) / (to - from));

// Temperatur → istilik/şaxta (22° = hazırkı görünüş). Zonalar: 20°-dən aşağı soyuq hava (--cold), 20–21° təmiz
// (yalnız hava axını), 22–24° şüşədə damcılar, 25°-dən yuxarı günəş (--sun). Keçidlər yumşaqdır; hamısı
// canvas-lara və CSS dəyişənlərinə (overlay-lər) yazılır.
export function applyTemp(temp: number, host: HTMLElement | null) {
  const sun = ramp(temp, 24.5, 27);
  const cold = ramp(-temp, -20.5, -18);
  climate.warm = clamp((temp - BASE_TEMP) / (MAX_TEMP - BASE_TEMP));
  climate.frost = clamp((BASE_TEMP - temp) / (BASE_TEMP - MIN_TEMP));
  climate.cold = cold;
  climate.drops = ramp(temp, 21, 22) * (1 - ramp(temp, 24, 25));
  host?.style.setProperty("--warm", String(climate.warm));
  host?.style.setProperty("--frost", String(climate.frost));
  host?.style.setProperty("--sun", String(sun));
  host?.style.setProperty("--cold", String(cold));
}
