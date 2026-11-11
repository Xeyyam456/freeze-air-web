import type { AirParticle, AirSource } from "@/types/site";
import { climate } from "../HeroClimate/climate";
import { spawn } from "./particles";

const R = 150; // kursorun təsir radiusu (px)
const mix = (a: number, b: number, k: number) => Math.round(a + (b - a) * k);

// Kursorun ətrafında soyuq işıq: hava "soyuyur"
function glow(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(climate.px, climate.py, 0, climate.px, climate.py, R * 1.3);
  g.addColorStop(0, `rgba(150, 215, 255, ${0.22 * climate.glow})`);
  g.addColorStop(1, "rgba(150, 215, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(climate.px - R * 1.3, climate.py - R * 1.3, R * 2.6, R * 2.6);
}

// Bir kadr: hissəciklər kursordan yayınır, istidə solğun/ilıq, şaxtada çox/parlaq olur
export function drawFrame(ctx: CanvasRenderingContext2D, ps: AirParticle[], src: AirSource, w: number, h: number, time: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = "round";
  const { warm, frost, px, py } = climate;
  climate.glow += ((px > -1e3 ? 1 : 0) - climate.glow) * 0.08;
  if (climate.glow > 0.01) glow(ctx);
  const active = Math.min(ps.length, Math.round((70 + frost * 60 - warm * 35) * climate.density));
  const power = 1 + frost * 0.7 - warm * 0.5;
  for (let i = 0; i < active; i++) {
    const p = ps[i];
    p.life += 1;
    if (p.life > p.max || p.x < -40 || p.y > h + 40) spawn(src, p);
    const dx = p.x - px;
    const dy = p.y - py;
    const d = Math.hypot(dx, dy);
    const near = d < R ? 1 - d / R : 0;
    if (near > 0) {
      p.vx += (dx / d) * near * 0.35;
      p.vy += (dy / d) * near * 0.35;
    }
    // Yavaşca sola əyilir, bir az dalğalanır
    p.vx -= 0.012;
    p.vy *= 0.993;
    const wave = Math.sin((p.life + p.x) * 0.02 + time * 0.01) * 0.25;
    const ox = p.x;
    const oy = p.y;
    p.x += p.vx * (0.75 + power * 0.25);
    p.y += p.vy + wave;
    const k = p.life / p.max;
    // Soldakı mətnə çatmamış solur (başlıq və forma oxunaqlı qalsın)
    const fade = Math.min(1, Math.max(0, (p.x / w - 0.32) / 0.22));
    const alpha = Math.min(0.9, Math.sin(Math.PI * k) * 0.55 * fade * power * (1 + near * 0.8));
    ctx.strokeStyle = `rgba(${mix(200, 255, warm)}, ${mix(238, 205, warm)}, ${mix(255, 150, warm)}, ${alpha})`;
    ctx.lineWidth = p.w;
    ctx.beginPath();
    ctx.moveTo(ox - p.vx * 8, oy - p.vy * 8);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
}
