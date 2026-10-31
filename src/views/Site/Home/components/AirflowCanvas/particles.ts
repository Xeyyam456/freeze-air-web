import type { AirParticle, AirSource } from "@/types/site";

export const COUNT = 70;

// Hissəcik barmaqlıqdan çıxır, əvvəl aşağı, sonra sola əyilərək otağa yayılır
export function spawn(src: AirSource, p?: AirParticle): AirParticle {
  const t = Math.random();
  const o = p ?? ({} as AirParticle);
  o.x = src.x0 + (src.x1 - src.x0) * t;
  o.y = src.y + Math.random() * 6;
  o.vx = -(0.4 + Math.random() * 0.9);
  o.vy = 0.9 + Math.random() * 0.9;
  o.life = 0;
  o.max = 160 + Math.random() * 160;
  o.w = 0.6 + Math.random() * 1.4;
  return o;
}

export function createParticles(src: AirSource): AirParticle[] {
  return Array.from({ length: COUNT }, () => {
    const p = spawn(src);
    p.life = Math.random() * p.max; // başlanğıcda hamısı eyni anda çıxmasın
    return p;
  });
}

// Bir kadr: hər hissəcik bir addım irəliləyir və nazik xətt kimi çəkilir
export function drawFrame(ctx: CanvasRenderingContext2D, ps: AirParticle[], src: AirSource, w: number, h: number, time: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = "round";
  for (const p of ps) {
    p.life += 1;
    if (p.life > p.max || p.x < -40 || p.y > h + 40) spawn(src, p);
    // Yavaşca sola əyilir, bir az dalğalanır
    p.vx -= 0.012;
    p.vy *= 0.993;
    const wave = Math.sin((p.life + p.x) * 0.02 + time * 0.01) * 0.25;
    const px = p.x;
    const py = p.y;
    p.x += p.vx;
    p.y += p.vy + wave;
    const k = p.life / p.max;
    // Yumşaq görünür, yumşaq itir; soldakı mətnə çatmamış solur (başlıq və forma oxunaqlı qalsın)
    const fade = Math.min(1, Math.max(0, (p.x / w - 0.32) / 0.22));
    const alpha = Math.sin(Math.PI * k) * 0.55 * fade;
    ctx.strokeStyle = `rgba(200, 238, 255, ${alpha})`;
    ctx.lineWidth = p.w;
    ctx.beginPath();
    ctx.moveTo(px - p.vx * 8, py - p.vy * 8);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
}
