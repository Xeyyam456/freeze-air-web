import type { Drop } from "@/types/site";

export const MAX = 90;

// Yeni damcı: ölçüsü əsasən kiçik, bəzən iri; bir hissəsi gec-tez süzülür
export function spawnDrop(w: number, h: number, d?: Drop): Drop {
  const o = d ?? ({} as Drop);
  o.x = Math.random() * w;
  o.y = o.y0 = Math.random() * h * 0.92;
  o.r = 3 + Math.random() * 4 + (Math.random() < 0.2 ? 4 : 0);
  o.vy = 0;
  o.run = Math.random() < 0.4;
  o.wait = 90 + Math.random() * 700;
  o.age = 0;
  o.life = 1500 + Math.random() * 2500;
  o.a = 0;
  return o;
}

// Bir addım: yavaş görünür, gözləyir, süzülür (ləngiyib-sürətlənərək, azalaraq), sonda itir
export function stepDrop(d: Drop, w: number, h: number) {
  d.age += 1;
  const dying = d.age > d.life || d.r < 2;
  d.a = Math.min(1, Math.max(0, d.a + (dying ? -0.02 : 0.02)));
  if (dying && d.a === 0) { spawnDrop(w, h, d); return; }
  if (!d.run || d.age < d.wait) return;
  d.vy = Math.min(d.vy + (Math.random() < 0.06 ? 0.12 : 0.01), 0.9 + d.r * 0.18);
  if (Math.random() < 0.02) d.vy *= 0.3; // damcı bir anlıq ilişir
  d.y += d.vy;
  d.r -= 0.0014;
  if (d.y > h + 12) d.life = 0;
}

// Damcı: yarımşəffaf cisim, solda-yuxarıda parıltı, aşağıda kölgə; süzülürsə arxasında nazik iz
export function drawDrop(ctx: CanvasRenderingContext2D, d: Drop) {
  const { x, y, r } = d;
  ctx.globalAlpha = d.a;
  if (d.vy > 0.05) {
    ctx.strokeStyle = "rgba(200, 225, 245, 0.1)";
    ctx.lineWidth = r * 0.55;
    ctx.beginPath();
    ctx.moveTo(x, d.y0);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.1);
  g.addColorStop(0, "rgba(255, 255, 255, 0.24)");
  g.addColorStop(1, "rgba(120, 170, 210, 0.1)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.9, r * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.stroke();
  ctx.strokeStyle = "rgba(0, 15, 35, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.9, r * 1.1, 0, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.35, y - r * 0.4, r * 0.22, r * 0.14, -0.6, 0, Math.PI * 2);
  ctx.fill();
}
