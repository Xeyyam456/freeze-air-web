import type { Drop } from "@/types/site";

export const MAX = 160;

// Hovuzda damcıların 2/3-i süzülür (axın kəsilmir), 1/3-i yerində durub tez quruyur
export const isRunner = (i: number) => i % 3 !== 0;

export function spawnDrop(w: number, h: number, run: boolean, d?: Drop): Drop {
  const o = d ?? ({} as Drop);
  o.run = run;
  o.x = Math.random() * w;
  o.y = Math.random() * h * (run ? 0.5 : 0.95);
  o.px = o.x;
  o.py = o.y;
  o.r = run ? 3.8 + Math.random() ** 1.4 * 4.5 + (Math.random() < 0.1 ? 3 : 0) : 2 + Math.random() ** 1.5 * 4.5;
  o.vy = 0;
  o.wait = Math.random() * 90;
  o.age = 0;
  o.life = run ? 1e6 : 400 + Math.random() * 1000;
  o.a = 0;
  o.stuck = 0;
  o.sway = 0;
  return o;
}

// Bir addım. Süzülən damcı: sürətlənir, bəzən qəfil ilişir, bir az yana yırğalanır, suyunu izdə qoyub kiçilir.
// Xırda damcı: yerində durur, bir müddətdən sonra quruyub itir.
export function stepDrop(d: Drop, w: number, h: number) {
  d.age += 1;
  const dying = d.age > d.life || d.r < 3.2;
  d.a = Math.min(1, Math.max(0, d.a + (dying ? -0.025 : 0.02)));
  if (dying && d.a === 0) {
    spawnDrop(w, h, d.run, d);
    if (d.run) d.y = d.py = Math.random() * h * 0.1;
    return;
  }
  if (!d.run || d.age < d.wait) return;
  if (d.stuck > 0) {
    d.stuck -= 1;
    d.vy *= 0.8;
  } else {
    d.vy = Math.min(d.vy + 0.02 + Math.random() * 0.05, 0.8 + d.r * 0.25);
    if (Math.random() < 0.01) d.stuck = 15 + Math.random() * 60;
  }
  d.sway = (d.sway + (Math.random() - 0.5) * 0.06) * 0.97;
  d.x += d.sway * d.vy * 0.5;
  d.y += d.vy;
  d.r -= 0.0006;
  if (d.y > h + 12) d.r = 0;
}

// Süzülən damcı yolüstü xırda damcıları özünə qatır və böyüyür
export function mergeDrops(ds: Drop[], n: number) {
  for (let i = 0; i < n; i++) {
    const a = ds[i];
    if (!a.run || a.vy < 0.1) continue;
    for (let j = 0; j < n; j++) {
      const b = ds[j];
      if (b.run || b.a < 0.5 || b.age > b.life) continue;
      if (Math.abs(a.x - b.x) < a.r * 0.8 + b.r && Math.abs(a.y - b.y) < a.r + b.r) {
        a.r = Math.min(12, Math.hypot(a.r, b.r * 0.7));
        b.life = 0;
      }
    }
  }
}
