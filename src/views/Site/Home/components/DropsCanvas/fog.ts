// Soyuq şüşədəki buxar: bütün şüşəni örtən minlərlə xırda su muncuğu. Bir dəfə ayrıca qatda çəkilir;
// süzülən damcının izi ("iz" qatı) onu hər kadrda silir, iz yavaş-yavaş quruyub muncuqlar geri qayıdır.
export function paintFog(c: CanvasRenderingContext2D, w: number, h: number) {
  c.clearRect(0, 0, w, h);
  c.fillStyle = "rgba(210, 230, 245, 0.13)";
  c.fillRect(0, 0, w, h);
  const n = Math.round((w * h) / 240);
  for (let i = 0; i < n; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 0.7 + Math.random() ** 2 * 2.3;
    c.fillStyle = "rgba(205, 228, 245, 0.34)";
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255, 255, 255, 0.65)";
    c.beginPath();
    c.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2);
    c.fill();
  }
}

// Buxar qatını çəkir, üzərindən süzülən damcıların izini silir (iz qatı ilə "destination-out")
export function drawFog(ctx: CanvasRenderingContext2D, fog: HTMLCanvasElement, track: HTMLCanvasElement, w: number, h: number, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.drawImage(fog, 0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "destination-out";
  ctx.drawImage(track, 0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
}

// İz qatını bir az "qurudur": silinmiş zolaqlar tədricən buxarla örtülür
export function dryTrack(t: CanvasRenderingContext2D, w: number, h: number) {
  t.globalCompositeOperation = "destination-out";
  t.fillStyle = "rgba(0, 0, 0, 0.06)";
  t.fillRect(0, 0, w, h);
  t.globalCompositeOperation = "source-over";
}
