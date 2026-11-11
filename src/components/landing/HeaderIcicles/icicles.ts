// Real buz saçaqlarının sabit (hər renderdə eyni) həndəsəsi (nümunə: uzun, nazik, şəffaf, yavaş daralan, ucunda damcı).
// Təsadüfilik `rnd` ilə; naxış TILE enində təkrarlanır (SVG pattern, piksel miqyası pozulmur).
export const TILE = 1600;
export const ICE_H = 132;
const N = 14; // gövdənin konturunun nöqtə sayı

const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const f = (n: number) => n.toFixed(1);
const pt = (p: number[]) => `${f(p[0])} ${f(p[1])}`;

export type Icicle = { x: number; hw: number; len: number; lean: number; ph: number; back: boolean; i: number };

// Əsas saçaqlar uzun və enli, arxa qat qısa və nazik (dərinlik); yerli "soyuqluq" zərfi ilə uzunluq dəyişir
export function makeIcicles(): Icicle[] {
  const out: Icicle[] = [];
  let x = 14;
  for (let i = 0; x < TILE - 24; i++) {
    const env = 0.6 + 0.4 * Math.sin(x / 150 + 1.1);
    const back = rnd(i, 4) > 0.62;
    const len = back ? 16 + rnd(i, 1) * 34 : 26 + rnd(i, 1) ** 1.2 * 86 * env;
    const hw = back ? 2.2 + rnd(i, 2) * 1.6 : 3.2 + len * 0.035 + rnd(i, 2) * 2.2;
    out.push({ x: x + (back ? (rnd(i, 5) - 0.5) * 20 : 0), hw, len, lean: (rnd(i, 3) - 0.5) * hw * 1.6, ph: rnd(i, 6) * 6.28, back, i });
    x += back ? 12 + rnd(i, 7) * 18 : hw * 2 + 10 + rnd(i, 7) * 26;
  }
  return out;
}

// Yarım en: yuxarıda yayılır, yavaş daralır, bir az dalğalanır; mərkəz xətti yana əyilir
const halfW = (c: Icicle, t: number) => c.hw * (1 - 0.62 * t) * (1 + 0.45 * Math.max(0, 1 - t * 9)) * (1 + 0.1 * Math.sin(t * 10 + c.ph));
const centerX = (c: Icicle, t: number) => c.x + c.lean * t ** 1.6 + Math.sin(t * 4 + c.ph) * 0.6;
const side = (c: Icicle, s: -1 | 1) => Array.from({ length: N + 1 }, (_, k) => [centerX(c, k / N) + s * halfW(c, k / N), (k / N) * c.len]);

export function bodyPath(c: Icicle): string {
  const l = side(c, -1).map(pt).join("L");
  const r = side(c, 1).reverse().map(pt).join("L");
  return `M${l}L${r}Z`;
}

// Kənar parıltısı (işıq sınması): kənar boyu nazik xətt
export function rimPath(c: Icicle, s: -1 | 1): string {
  return `M${side(c, s).slice(1, N - 1).map(pt).join("L")}`;
}

// Ucdakı yumru damcı
export function tipOf(c: Icicle) {
  return { x: centerX(c, 1), y: c.len, r: Math.max(2, c.hw * 0.42) };
}

// Daxildəki hava qabarcıqları (yuxarı 2/3-də)
export function bubbles(c: Icicle): { cx: number; cy: number; rx: number; ry: number }[] {
  return Array.from({ length: c.back ? 2 : 6 }, (_, b) => {
    const t = 0.06 + rnd(c.i * 7 + b, 21) * 0.62;
    const rx = 0.55 + rnd(c.i * 7 + b, 22) * 1.1;
    return { cx: centerX(c, t) + (rnd(c.i * 7 + b, 23) - 0.5) * halfW(c, t) * 1.1, cy: t * c.len, rx, ry: rx * (1 + rnd(c.i * 7 + b, 24) * 1.8) };
  });
}

// Qırov: xırda altıguşəli kristallar (üç diametr) saçaqların yuxarı kənarında
export function frostPath(): string {
  let d = "";
  for (let k = 0; k < 16; k++) {
    const cx = rnd(k, 11) * TILE;
    const cy = 2 + rnd(k, 12) * 5;
    const r = 3 + rnd(k, 13) * 4.5;
    const a0 = rnd(k, 14) * Math.PI;
    for (let s = 0; s < 3; s++) {
      const a = a0 + (s * Math.PI) / 3;
      d += `M${f(cx - Math.cos(a) * r)} ${f(cy - Math.sin(a) * r)}L${f(cx + Math.cos(a) * r)} ${f(cy + Math.sin(a) * r)}`;
    }
  }
  return d;
}

// Damcı yığılan ən uzun beş ön saçaq (damcı ucun yumru damcısının altından başlayır)
export function dropTips(list: Icicle[]): { x: number; y: number; i: number }[] {
  return list.filter((c) => !c.back && c.len > 58 && c.x < TILE - 40).slice(0, 5).map((c, i) => {
    const t = tipOf(c);
    return { x: t.x, y: t.y + t.r * 2, i };
  });
}
