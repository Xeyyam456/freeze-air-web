import { useEffect, type RefObject } from "react";
import type { Drop } from "@/types/site";
import { climate } from "../HeroClimate/climate";
import { drawDrop, MAX, spawnDrop, stepDrop } from "./drops";

// Şüşə damcıları: ekrandan çıxanda və tab gizli olanda dayanır; hərəkət azaldılıbsa heç nə çəkilmir.
// Sayı istiliklə artır (şüşə "tərləyir"), şaxtada azalır.
export function useDrops(ref: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0;
    let h = 0;
    let ds: Drop[] = [];
    let raf = 0;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ds = Array.from({ length: MAX }, () => spawnDrop(w, h));
    };
    size();

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const n = Math.min(MAX, Math.max(20, Math.round((36 + climate.warm * 44 - climate.frost * 12) * climate.density)));
      for (let i = 0; i < n; i++) { stepDrop(ds[i], w, h); drawDrop(ctx, ds[i]); }
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
