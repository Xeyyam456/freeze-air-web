"use client";

import { useEffect, useRef } from "react";

// Hero şəklindəki kondisionerdən çıxan soyuq hava: nazik, yarımşəffaf axın xətləri.
// Mənbə (kondisionerin barmaqlığı) və istiqamət hero ölçüsünə nisbətlə verilir: şəkil `object-top` ilə yerləşir.
// Ekrandan çıxanda və tab gizli olanda dayanır; hərəkət azaldılıbsa heç nə çəkilmir.
const SOURCE = { x0: 0.6, x1: 0.92, y: 0.36 }; // barmaqlığın sol/sağ kənarı və hündürlüyü (hero eninə/hündürlüyünə nisbət)
const COUNT = 70;

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; w: number };

export function AirflowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Hissəcik barmaqlıqdan çıxır, əvvəl aşağı, sonra sola əyilərək otağa yayılır
    const spawn = (p?: P): P => {
      const t = Math.random();
      const o = p ?? ({} as P);
      o.x = w * (SOURCE.x0 + (SOURCE.x1 - SOURCE.x0) * t);
      o.y = h * SOURCE.y + Math.random() * 6;
      o.vx = -(0.4 + Math.random() * 0.9);
      o.vy = 0.9 + Math.random() * 0.9;
      o.life = 0;
      o.max = 160 + Math.random() * 160;
      o.w = 0.6 + Math.random() * 1.4;
      return o;
    };
    const ps: P[] = Array.from({ length: COUNT }, () => {
      const p = spawn();
      p.life = Math.random() * p.max; // başlanğıcda hamısı eyni anda çıxmasın
      return p;
    });

    let raf = 0;
    let running = false;
    let time = 0;
    const tick = () => {
      time += 1;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const p of ps) {
        p.life += 1;
        if (p.life > p.max || p.x < -40 || p.y > h + 40) spawn(p);
        // Yavaşca sola əyilir, bir az dalğalanır
        p.vx -= 0.012;
        p.vy *= 0.993;
        const wave = Math.sin((p.life + p.x) * 0.02 + time * 0.01) * 0.25;
        const px = p.x;
        const py = p.y;
        p.x += p.vx;
        p.y += p.vy + wave;
        const k = p.life / p.max;
        // Yumşaq görünür, yumşaq itir; soldakı mətnə çatmamış solur (başlıq və forma oxunaqlı qalsın)
        const fade = Math.min(1, Math.max(0, (p.x / w - 0.32) / 0.22));
        const alpha = Math.sin(Math.PI * k) * 0.55 * fade;
        ctx.strokeStyle = `rgba(200, 238, 255, ${alpha})`;
        ctx.lineWidth = p.w;
        ctx.beginPath();
        ctx.moveTo(px - p.vx * 8, py - p.vy * 8);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
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
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen" />;
}
