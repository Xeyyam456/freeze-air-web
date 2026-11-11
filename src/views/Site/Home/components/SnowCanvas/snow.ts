import type { SnowParticle } from "@/types/site";

export const SNOW_MAX = 140;
const PUSH = 110; // kursorun qar dənələrini itələmə radiusu (px)

// Yeni qar dənəsi: dərinliyə görə ölçü, sürət və şəffaflıq (iri = yaxın = sürətli və parlaq).
// Hava axınının istiqamətinə uyğun yavaşca sola sürüşür.
export function spawnFlake(w: number, h: number, fromTop: boolean, p?: SnowParticle): SnowParticle {
  const o = p ?? ({} as SnowParticle);
  const depth = Math.random();
  o.r = 1.2 + depth ** 1.6 * 4.8;
  o.x = Math.random() * w;
  o.y = fromTop ? -10 - Math.random() * 40 : Math.random() * h;
  o.vy = 0.35 + depth * 0.9 + Math.random() * 0.2;
  o.vx = -0.12 - depth * 0.25;
  o.phase = Math.random() * Math.PI * 2;
  o.sway = 0.3 + Math.random() * 0.7;
  o.rot = Math.random() * Math.PI * 2;
  o.spin = (Math.random() - 0.5) * 0.03;
  o.a = 0.35 + depth * 0.55;
  return o;
}

// Bir addım: yana yellənərək enir, kursordan yayınır, çıxanda yuxarıdan yenidən başlayır
export function stepFlake(p: SnowParticle, w: number, h: number, px: number, py: number) {
  p.phase += 0.02;
  p.x += p.vx + Math.sin(p.phase) * p.sway * 0.6;
  p.y += p.vy;
  p.rot += p.spin;
  const dx = p.x - px;
  const dy = p.y - py;
  const d = Math.hypot(dx, dy);
  if (d < PUSH && d > 0) {
    p.x += (dx / d) * (1 - d / PUSH) * 2;
    p.y += (dy / d) * (1 - d / PUSH) * 2;
  }
  if (p.y > h + 12 || p.x < -24 || p.x > w + 24) spawnFlake(w, h, true, p);
}

// Xırda dənə: yumşaq nöqtə; iri dənə: altıguşəli kristal (üç diametr + qısa budaqlar)
export function drawFlake(ctx: CanvasRenderingContext2D, p: SnowParticle, k: number) {
  ctx.globalAlpha = p.a * k;
  if (p.r < 3) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.strokeStyle = "#eaf7ff";
  ctx.lineWidth = Math.max(1, p.r * 0.2);
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    ctx.moveTo(-c * p.r, -s * p.r);
    ctx.lineTo(c * p.r, s * p.r);
    for (const m of [-1, 1]) {
      const bx = c * p.r * 0.6 * m;
      const by = s * p.r * 0.6 * m;
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(a + 1) * p.r * 0.3, by + Math.sin(a + 1) * p.r * 0.3);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(a - 1) * p.r * 0.3, by + Math.sin(a - 1) * p.r * 0.3);
    }
  }
  ctx.stroke();
  ctx.restore();
}
