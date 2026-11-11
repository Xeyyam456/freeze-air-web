import { useEffect, type RefObject } from "react";
import { AWAY, climate } from "../HeroClimate/climate";

// Kursor/barmaq canvas koordinatında ortaq vəziyyətə yazılır; hero-dan çıxanda "uzaq" olur
export function usePointer(ref: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    climate.density = window.matchMedia("(pointer: coarse)").matches ? 0.6 : 1;
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      climate.px = inside ? e.clientX - r.left : AWAY;
      climate.py = inside ? e.clientY - r.top : AWAY;
    };
    const leave = () => { climate.px = AWAY; climate.py = AWAY; };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
      leave();
    };
  }, [ref]);
}
