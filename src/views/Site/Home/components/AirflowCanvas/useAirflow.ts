import { useEffect, type RefObject } from "react";
import type { AirSource } from "@/types/site";
import { airSource } from "./airSource";
import { createParticles, drawFrame } from "./particles";

// Hava axını animasiyası: ekrandan çıxanda və tab gizli olanda dayanır; hərəkət azaldılıbsa heç nə çəkilmir
export function useAirflow(ref: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let src: AirSource = { x0: 0, x1: 0, y: 0 };
    const img = canvas.parentElement?.querySelector("img");
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      src = airSource(img, w, h);
    };
    resize();
    if (img && !img.complete) img.addEventListener("load", resize, { once: true });

    const ps = createParticles(src);
    let raf = 0;
    let running = false;
    let time = 0;
    const tick = () => {
      time += 1;
      drawFrame(ctx, ps, src, w, h, time);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ref]);
}
