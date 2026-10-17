"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Açıq saytın menyusu (göy zolaqda): hər bənd ayrıca səhifədir, aktiv səhifə seçilir
export function SiteNav({ pages, className = "" }: { pages: { href: string; label: string }[]; className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={`flex items-stretch overflow-x-auto [scrollbar-width:none] ${className}`}>
      {pages.map((p) => {
        const active = p.href === "/" ? pathname === "/" : pathname.startsWith(p.href);
        return (
          <Link
            key={p.href}
            href={p.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex shrink-0 items-center px-5 py-3.5 text-sm font-semibold transition-colors ${
              active ? "bg-night text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
            }`}
          >
            {p.label}
          </Link>
        );
      })}
    </nav>
  );
}
