import type { AirParticle, AirSource } from "@/types/site";

export const COUNT = 110; // hovuz; aktiv sayı iqlimə görə dəyişir (drawFrame.ts)

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
