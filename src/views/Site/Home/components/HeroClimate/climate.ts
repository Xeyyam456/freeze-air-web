import type { HeroClimate } from "@/types/site";

export const AWAY = -1e4;
export const MIN_TEMP = 16;
export const MAX_TEMP = 30;
export const BASE_TEMP = 22;
export const TEMP_EVENT = "climate-temp";

// Canvas-ların hər kadrda oxuduğu ortaq vəziyyət
export const climate: HeroClimate = { warm: 0, frost: 0, px: AWAY, py: AWAY, glow: 0, density: 1, drops: 1, cold: 0 };

const clamp = (v: number) => Math.min(1, Math.max(0, v));

const ramp = (v: number, from: number, to: number) => clamp((v - from) / (to - from));

// Temperatur → istilik/şaxta (22° = hazırkı görünüş). Zonalar: 20°-dən aşağı soyuq hava və qar (--cold), 16–18°-də
// şüşədə soyuqdan buxar və süzülən damcılar (--steam), 20–24° təmiz (yalnız hava axını), 25°-dən yuxarı günəş (--sun).
// Keçidlər yumşaqdır; hamısı canvas-lara və CSS dəyişənlərinə (overlay-lər) yazılır.
export function applyTemp(temp: number, host: HTMLElement | null) {
  const sun = ramp(temp, 24.5, 27);
  const cold = ramp(-temp, -20.5, -18);
  climate.warm = clamp((temp - BASE_TEMP) / (MAX_TEMP - BASE_TEMP));
  climate.frost = clamp((BASE_TEMP - temp) / (BASE_TEMP - MIN_TEMP));
  climate.cold = cold;
  climate.drops = ramp(-temp, -18.5, -16.5);
  host?.style.setProperty("--warm", String(climate.warm));
  host?.style.setProperty("--frost", String(climate.frost));
  host?.style.setProperty("--sun", String(sun));
  host?.style.setProperty("--cold", String(cold));
  host?.style.setProperty("--steam", String(climate.drops));
  // Header-in buz saçaqları (HeaderIcicles) hero-dan kənardadır: --cold və --sun kökə də yazılır
  const root = typeof document === "undefined" ? null : document.documentElement;
  root?.style.setProperty("--cold", String(cold));
  root?.style.setProperty("--sun", String(sun));
  root?.style.setProperty("--melt", String(ramp(temp, 24, MAX_TEMP))); // 24°-dən başlayıb 30°-də 1: saçaqlar tədricən əriyib tam itir
  if (root) {
    root.dataset.temp = String(temp);
    window.dispatchEvent(new Event(TEMP_EVENT)); // header-dəki temperatur çipi (HeaderTemp) yenilənir
  }
}

// Səhifədən çıxanda kökdəki dəyişənləri sıfırla (başqa səhifələrdə header normal qalsın)
export function resetRootTemp() {
  document.documentElement.style.removeProperty("--cold");
  document.documentElement.style.removeProperty("--sun");
  document.documentElement.style.removeProperty("--melt");
  delete document.documentElement.dataset.temp;
  window.dispatchEvent(new Event(TEMP_EVENT));
}
