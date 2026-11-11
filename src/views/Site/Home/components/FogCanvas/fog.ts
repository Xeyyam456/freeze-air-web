export const SCALE = 0.4; // buxar aşağı ayırdetmədə çəkilir: yüngül və özlüyündə yumşaq
const BRUSH = 70; // silmə fırçasının radiusu (aşağı miqyasda, piksel)

// Bütün şüşəni buxarla doldurur
export function fillFog(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(226, 240, 252, ${alpha})`;
  ctx.fillRect(0, 0, w, h);
}

// Barmaq/kursor izi: buxarı yumşaq dairə ilə silir
export function wipe(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, BRUSH);
  g.addColorStop(0, "rgba(0, 0, 0, 0.9)");
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = g;
  ctx.fillRect(x - BRUSH, y - BRUSH, BRUSH * 2, BRUSH * 2);
}
