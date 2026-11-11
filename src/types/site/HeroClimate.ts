// Hero-nun ortaq "iqlim" vəziyyəti: temperatur sürgüsü və kursor (canvas-lar hər kadrda oxuyur, render yoxdur).
// drops — damcıların görünürlüyü (yalnız 22–24°; ondan yuxarıda günəş, aşağıda soyuq hava və ya təmiz ekran)
export type HeroClimate = { warm: number; frost: number; px: number; py: number; glow: number; density: number; drops: number };
