import { useEffect, type RefObject } from "react";
import type { Drop } from "@/types/site";
import { climate } from "../HeroClimate/climate";
import { drawDrop, drawTrail } from "./drawDrop";
import { isRunner, MAX, mergeDrops, spawnDrop, stepDrop } from "./drops";
import { makeLens, type Lens } from "./lens";

const DRY_EVERY = 20; // kadr: nəm iz bu aralıqla bir az quruyur

// Şüşə damcıları: ekrandan çıxanda və tab gizli olanda dayanır; hərəkət azaldılıbsa heç nə çəkilmir.
// Sayı istiliklə artır (şüşə "tərləyir"), şaxtada azalır.
export function useDrops(ref: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const trail = document.createElement("canvas");
    const tctx = trail.getContext("2d");
    if (!canvas || !ctx || !tctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0;
    let h = 0;
    let ds: Drop[] = [];
    let raf = 0;
    let frame = 0;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      for (const c of [canvas, trail]) { c.width = w * dpr; c.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ds = Array.from({ length: MAX }, (_, i) => spawnDrop(w, h, isRunner(i)));
      lens = makeLens(img, w, h);
    };
    const img = canvas.parentElement?.querySelector("img") ?? null;
    let lens: Lens | null = null;
    size();
    if (img && !img.complete) img.addEventListener("load", size, { once: true });

    const tick = () => {
      frame += 1;
      if (frame % DRY_EVERY === 0) {
        tctx.globalCompositeOperation = "destination-out";
        tctx.fillStyle = "rgba(0, 0, 0, 0.06)";
        tctx.fillRect(0, 0, w, h);
        tctx.globalCompositeOperation = "source-over";
      }
      const n = Math.min(MAX, Math.max(20, Math.round((36 + climate.warm * 44 - climate.frost * 12) * climate.density)));
      for (let i = 0; i < n; i++) { stepDrop(ds[i], w, h); if (ds[i].run) drawTrail(tctx, ds[i]); }
      mergeDrops(ds, n);
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.drawImage(trail, 0, 0, w, h);
      for (let i = 0; i < n; i++) drawDrop(ctx, ds[i], lens);
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !document.hidden) start(); else stop(); });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : visible && start());
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    return () => { stop(); io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [ref]);
}
