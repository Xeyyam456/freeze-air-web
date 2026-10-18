"use client";

import { useEffect, useRef, useState } from "react";

// Bölmə görünəndə yumşaq açılır (aşağıdan yuxarı + solğunluqdan). CSS: globals.css `.js .reveal`.
// JS işləməsə hamısı görünür; hərəkət azaldılıbsa (prefers-reduced-motion) dərhal görünür.
export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}>
      {children}
    </div>
  );
}
