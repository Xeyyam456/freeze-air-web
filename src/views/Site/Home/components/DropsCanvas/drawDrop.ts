import type { Drop } from "@/types/site";
import { climate } from "../HeroClimate/climate";
import { drawLens, type Lens } from "./lens";

// Nəm iz: damcının keçdiyi yer ayrıca qatda yumşaq, çox zəif zolaq kimi qalır və tez quruyur
export function drawTrail(t: CanvasRenderingContext2D, d: Drop) {
  if (d.a < 0.2 || Math.abs(d.y - d.py) < 0.5) return;
  t.strokeStyle = "rgba(205, 228, 245, 0.07)";
  t.lineWidth = Math.max(1.2, d.r * 0.7);
  t.beginPath();
  t.moveTo(d.px, d.py);
  t.lineTo(d.x, d.y);
  t.stroke();
  d.px = d.x;
  d.py = d.y;
}

// Damcı: iri olanda linza (tərs mənzərə), hamısında tünd üst haşiyə, altda işıq toplanması, parıltı;
// hərəkətdə olanda aşağıya doğru uzanır
export function drawDrop(ctx: CanvasRenderingContext2D, d: Drop, lens: Lens | null) {
  const { x, y, r } = d;
  const rx = r * 0.88;
  const ry = r * (1.05 + Math.min(d.vy, 1.6) * 0.22);
  ctx.globalAlpha = d.a * climate.drops;
  if (lens && r > 2.4) drawLens(ctx, lens, x, y, rx, ry);
  else {
    ctx.fillStyle = "rgba(130, 175, 210, 0.14)";
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(0, 12, 30, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(235, 247, 255, 0.5)";
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.86, ry * 0.86, 0, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.beginPath();
  ctx.ellipse(x - rx * 0.42, y - ry * 0.45, Math.max(0.6, rx * 0.2), Math.max(0.4, ry * 0.12), -0.6, 0, Math.PI * 2);
  ctx.fill();
}
