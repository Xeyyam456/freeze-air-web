import type { AirSource } from "@/types/site";

// Barmaqlığın sol/sağ kənarı və hündürlüyü (şəklin eninə/hündürlüyünə nisbət)
const SOURCE = { x0: 0.6, x1: 0.92, y: 0.31 };

// Barmaqlığın ekrandakı yeri (piksel): şəklin ekrandakı yerindən hesablanır (object-cover + object-position),
// hansı endə şəkil kəsilsə də axın kondisionerdən çıxır. Şəkil yoxdursa və ya yüklənməyibsə hero-ya nisbət götürülür.
export function airSource(img: HTMLImageElement | null | undefined, w: number, h: number): AirSource {
  if (img?.naturalWidth) {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const rw = img.naturalWidth * scale;
    const rh = img.naturalHeight * scale;
    const [px, py] = getComputedStyle(img).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
    const ox = (w - rw) * px;
    const oy = (h - rh) * py;
    return { x0: ox + rw * SOURCE.x0, x1: ox + rw * SOURCE.x1, y: oy + rh * SOURCE.y };
  }
  return { x0: w * SOURCE.x0, x1: w * SOURCE.x1, y: h * SOURCE.y };
}
