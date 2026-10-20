"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";

// Kiçik ekranların menyusu (< 1024px, header-də SiteNav-ın yerinə): ☰ düyməsi klikdə header-in altında panel açır.
// Panel: səhifələr (planşetdə 2 sütun), mobildə hesab, altında telefon. "Xidmət növləri" yalnız ≥ 1024 header-dədir
// (istifadəçi qərarı). Kənara klik, Escape və səhifə dəyişməsi paneli bağlayır.
export function SiteMenu({ pages, phone, tel, account }: {
  pages: { href: string; label: string }[];
  phone: string;
  tel?: string;
  account?: React.ReactNode; // mobildə header-dəki hesab düyməsinin yerinə (səhifələrin altında)
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Başqa səhifəyə keçəndə panel bağlanır
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

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
    <div ref={box} className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Menyu"
        className={`grid h-11 w-11 place-items-center rounded-full ring-1 transition-colors ${
          open ? "bg-night text-white ring-night" : "text-night ring-night/10 hover:bg-glacier"
        }`}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-night/[0.06] bg-white shadow-[0_24px_48px_rgba(6,25,43,0.14)]">
          <div className="site-wrap grid gap-4 py-6">
            <ul className="grid gap-1 sm:grid-cols-2 sm:gap-x-4">
              {pages.map((p) => {
                const active = p.href === "/" ? pathname === "/" : pathname.startsWith(p.href);
                return (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex h-11 items-center rounded-2xl px-4 font-semibold transition-colors ${
                        active ? "bg-glacier text-night" : "text-night/70 hover:bg-glacier hover:text-night"
                      }`}
                    >
                      {p.label}
                    </Link>
                  </li>
                );
              })}
              {account && <li className="mt-1 border-t border-night/[0.06] pt-1 sm:hidden">{account}</li>}
            </ul>

            {tel && (
              <a href={tel} className="flex items-center gap-3 rounded-2xl border-t border-night/[0.06] px-3 pt-4 font-bold text-night transition-colors hover:text-cold">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-cold/10 text-cold"><Phone size={17} /></span>
                {phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
