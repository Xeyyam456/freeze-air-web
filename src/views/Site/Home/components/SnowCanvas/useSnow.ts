import { useEffect, type RefObject } from "react";
import type { SnowParticle } from "@/types/site";
import { AWAY, climate } from "../HeroClimate/climate";
import { drawFlake, SNOW_MAX, spawnFlake, stepFlake } from "./snow";

// Qar yağışı: 20°-dən aşağıda görünür (climate.cold). Ekrandan çıxanda və tab gizli olanda dayanır;
// hərəkət azaldılıbsa heç nə çəkilmir; soyuq rejimi deyilsə kadr boş keçir.
// always: temperatura baxmadan tam qar (404 səhifəsi); kursor yenə qarı itələyir.
export function useSnow(ref: RefObject<HTMLCanvasElement | null>, always = false) {
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0;
    let h = 0;
    let ps: SnowParticle[] = [];
    let raf = 0;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ps = Array.from({ length: SNOW_MAX }, () => spawnFlake(w, h, false));
    };
    size();

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const k = always ? 1 : climate.cold;
      if (k >= 0.02) {
        const n = Math.round(SNOW_MAX * k * (always ? 1 : climate.density));
        for (let i = 0; i < n; i++) { stepFlake(ps[i], w, h, climate.px, climate.py); drawFlake(ctx, ps[i], k); }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(tick);
    };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !document.hidden) start(); else stop(); });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : visible && start());
    document.addEventListener("visibilitychange", onVis);
    const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); climate.px = e.clientX - r.left; climate.py = e.clientY - r.top; };
    if (always) window.addEventListener("pointermove", onMove);
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    return () => { stop(); io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", onVis); if (always) { window.removeEventListener("pointermove", onMove); climate.px = AWAY; climate.py = AWAY; } };
  }, [ref, always]);
}
