"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Wrench } from "lucide-react";

type NavService = { slug: string; title: string };

// Açıq saytın menyusu (header-in ortasında həb düymələr): hər bənd ayrıca səhifədir, aktiv səhifə ağ həblə seçilir.
// Sonda "Xidmət növləri" düyməsi: klikləyəndə xidmətlərin siyahısı açılır (masaüstündə; mobildə siyahı /xidmetler səhifəsindədir).
export function SiteNav({ pages, services = [], className = "" }: {
  pages: { href: string; label: string }[];
  services?: NavService[];
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Kənara klik və ya Escape siyahını bağlayır
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav className={`flex items-center gap-1 overflow-x-auto rounded-full bg-glacier/80 p-1 ring-1 ring-night/[0.06] [scrollbar-width:none] md:overflow-visible ${className}`}>
      {pages.map((p) => {
        const active = p.href === "/" ? pathname === "/" : pathname.startsWith(p.href);
        return (
          <Link
            key={p.href}
            href={p.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-all ${
              active ? "bg-white text-night shadow-[0_2px_8px_rgba(6,25,43,0.1)]" : "text-night/60 hover:text-night"
            }`}
          >
            {p.label}
          </Link>
        );
      })}

      {services.length > 0 && (
        <div ref={box} className="relative hidden items-center md:flex">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="true"
            className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all ${
              open ? "bg-white text-night shadow-[0_2px_8px_rgba(6,25,43,0.1)]" : "text-night/60 hover:text-night"
            }`}
          >
            <Wrench size={15} /> Xidmət növləri
            <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {open && (
            <ul className="absolute right-0 top-full z-40 mt-4 w-72 rounded-2xl bg-white p-2 shadow-[0_18px_40px_rgba(6,25,43,0.22)] ring-1 ring-night/10">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/xidmet/${s.slug}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-night transition-colors hover:bg-cold/10 hover:text-cold"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </nav>
  );
}
