import { useEffect, type RefObject } from "react";
import type { Drop } from "@/types/site";
import { climate } from "../HeroClimate/climate";
import { drawDrop, drawTrail } from "./drawDrop";
import { isRunner, MAX, mergeDrops, spawnDrop, stepDrop } from "./drops";
import { drawFog, dryTrack, paintFog } from "./fog";
import { makeLens, type Lens } from "./lens";

const DRY_EVERY = 20; // kadr: silinmiş zolaqlar bu aralıqla bir az quruyur (buxar geri qayıdır)

// Soyuq şüşədə kondensasiya: xırda muncuqlardan buxar qatı, onun üstündə linza kimi damcılar; ağırlaşan damcı
// yerindən qopub süzülür və arxasında buxarı silən təmiz zolaq qoyur. Ekrandan çıxanda və tab gizli olanda dayanır;
// hərəkət azaldılıbsa heç nə çəkilmir. Yalnız çox soyuqda (16–18°) görünür (climate.drops).
export function useDrops(ref: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const fog = document.createElement("canvas");
    const track = document.createElement("canvas");
    const fctx = fog.getContext("2d");
    const tctx = track.getContext("2d");
    if (!canvas || !ctx || !fctx || !tctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0;
    let h = 0;
    let ds: Drop[] = [];
    let raf = 0;
    let frame = 0;
    let lens: Lens | null = null;
    const img = canvas.parentElement?.querySelector("img") ?? null;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      for (const c of [canvas, fog, track]) { c.width = w * dpr; c.height = h * dpr; }
      for (const c of [ctx, fctx, tctx]) c.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintFog(fctx, w, h);
      ds = Array.from({ length: MAX }, (_, i) => spawnDrop(w, h, isRunner(i)));
      lens = makeLens(img, w, h);
    };
    size();
    if (img && !img.complete) img.addEventListener("load", size, { once: true });

    const tick = () => {
      frame += 1;
      if (frame % DRY_EVERY === 0) dryTrack(tctx, w, h);
      ctx.clearRect(0, 0, w, h);
      if (climate.drops < 0.02) { raf = requestAnimationFrame(tick); return; } // soyuq olmayan rejim: damcı yoxdur
      const n = Math.min(MAX, Math.round((20 + climate.frost * 30) * climate.density));
      for (let i = 0; i < n; i++) { stepDrop(ds[i], w, h); if (ds[i].run) drawTrail(tctx, ds[i]); }
      mergeDrops(ds, n);
      drawFog(ctx, fog, track, w, h, climate.drops);
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
