import type { AirSource } from "@/types/site";

// Barmaqlığın sol/sağ kənarı və hündürlüyü (şəklin eninə/hündürlüyünə nisbət)
const SOURCE = { x0: 0.6, x1: 0.92, y: 0.31 };

// Şəklin ekrandakı yeri (object-cover + object-position): miqyas, ölçü və yerdəyişmə (piksel)
export function coverRect(img: HTMLImageElement, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const rw = img.naturalWidth * scale;
  const rh = img.naturalHeight * scale;
  const [px, py] = getComputedStyle(img).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
  return { scale, rw, rh, ox: (w - rw) * px, oy: (h - rh) * py };
}

// Barmaqlığın ekrandakı yeri (piksel): şəklin ekrandakı yerindən hesablanır, hansı endə şəkil kəsilsə də
// axın kondisionerdən çıxır. Şəkil yoxdursa və ya yüklənməyibsə hero-ya nisbət götürülür.
export function airSource(img: HTMLImageElement | null | undefined, w: number, h: number): AirSource {
  if (img?.naturalWidth) {
    const { rw, rh, ox, oy } = coverRect(img, w, h);
    return { x0: ox + rw * SOURCE.x0, x1: ox + rw * SOURCE.x1, y: oy + rh * SOURCE.y };
  }
  return { x0: w * SOURCE.x0, x1: w * SOURCE.x1, y: h * SOURCE.y };
}
