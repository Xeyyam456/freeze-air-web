// Hero-nun ortaq "iqlim" vəziyyəti: temperatur sürgüsü və kursor (canvas-lar hər kadrda oxuyur, render yoxdur).
// drops — damcıların görünürlüyü (25°-dən yuxarı günəş, 20°-dən aşağı soyuq hava onları əvəz edir)
export type HeroClimate = { warm: number; frost: number; px: number; py: number; glow: number; density: number; drops: number };
