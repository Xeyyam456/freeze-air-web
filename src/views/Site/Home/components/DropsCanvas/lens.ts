import { coverRect } from "../AirflowCanvas/airSource";

// Damcının linzası üçün: hero şəkli və onun ekrandakı yeri
export type Lens = { img: HTMLImageElement; scale: number; ox: number; oy: number; w: number };

export function makeLens(img: HTMLImageElement | null, w: number, h: number): Lens | null {
  if (!img?.naturalWidth) return null;
  const { scale, ox, oy } = coverRect(img, w, h);
  return { img, scale, ox, oy, w };
}

// Üstdəki soldan-sağa tünd overlay-in (night/90 → night/10) damcının olduğu yerdəki qaranlığı
const shade = (t: number) => (t < 0.5 ? 0.9 - 0.5 * t : 0.65 - 1.1 * (t - 0.5));

// Real damcı kimi: arxadakı mənzərənin geniş hissəsi sıxılmış və TƏRS çevrilmiş şəkildə görünür
export function drawLens(ctx: CanvasRenderingContext2D, l: Lens, x: number, y: number, rx: number, ry: number) {
  const sw = (rx * 6) / l.scale;
  const sh = (ry * 6) / l.scale;
  const cx = (x - l.ox) / l.scale;
  const cy = (y - l.oy) / l.scale;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(x, y);
  ctx.rotate(Math.PI);
  ctx.drawImage(l.img, cx - sw / 2, cy - sh / 2, sw, sh, -rx, -ry, rx * 2, ry * 2);
  ctx.restore();
  ctx.fillStyle = `rgba(6, 25, 43, ${shade(x / l.w) * 0.9})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
