"use client";

import { useEffect, useRef, useState } from "react";

// "200+", "5 il", "24/7": başdakı rəqəm 0-dan sayılaraq artır, qalan hissə (+, il...) olduğu kimi qalır.
// Server tam dəyəri göndərir (JS-siz də düzgündür); sayğac görünəndə bir dəfə işləyir. Rəqəm yoxdursa olduğu kimi göstərilir.
const PARTS = /^(\D*?)(\d[\d.,\s]*)(.*)$/;

export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const m = PARTS.exec(value.trim());
  const target = m ? Number(m[2].replace(/[^\d]/g, "")) : NaN;
  const [shown, setShown] = useState(Number.isFinite(target) ? target : 0);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !Number.isFinite(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      const raf0 = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(raf0);
    }
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      setReady(true);
      const start = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setShown(Math.round(target * (1 - Math.pow(1 - p, 3)))); // easeOutCubic
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      setShown(0);
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target]);

  if (!m || !Number.isFinite(target)) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={`count-up ${ready ? "ready" : ""} ${className}`} aria-label={value}>
      <span aria-hidden="true">{m[1]}{shown}{m[3]}</span>
    </span>
  );
}
