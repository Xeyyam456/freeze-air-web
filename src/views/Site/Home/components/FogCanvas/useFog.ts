import { useEffect, type RefObject } from "react";
import { fillFog, SCALE, wipe } from "./fog";

const REGROW_AFTER = 1500; // ms: kursor dayananda buxar yenidən yığılmağa başlayır
const FULL_AFTER = 12000; // ms: bu müddətdən sonra tam örtülür və dövr dayanır

// Şüşə buxarı: yalnız dəqiq kursorlu (siçan) qurğuda və hərəkət azaldılmayıbsa işləyir; sürüşməni pozmasın deyə telefonda yoxdur
export function useFog(ref: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = ref.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !fine || calm) return;

    let w = 0;
    let h = 0;
    let last = 0;
    let raf = 0;
    const size = () => {
      w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
      canvas.width = w;
      canvas.height = h;
      fillFog(ctx, w, h, 1);
    };
    size();

    const loop = () => {
      const idle = performance.now() - last;
      if (idle > FULL_AFTER) { fillFog(ctx, w, h, 1); raf = 0; return; }
      if (idle > REGROW_AFTER) fillFog(ctx, w, h, 0.012);
      raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      wipe(ctx, (e.clientX - r.left) * SCALE, (e.clientY - r.top) * SCALE);
      last = performance.now();
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    return () => {
      window.removeEventListener("pointermove", move);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}
