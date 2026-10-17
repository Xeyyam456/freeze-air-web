"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutGrid, Store, TriangleAlert, UserCog, Users, Warehouse } from "lucide-react";

const NAV = [
  { href: "/panel", label: "Panel", icon: LayoutGrid },
  { href: "/sirketler", label: "Şirkətlər", icon: Building2 },
  { href: "/magazalar", label: "Mağazalar", icon: Store },
  { href: "/ustalar", label: "Ustalar", icon: Users },
  { href: "/rehberlik", label: "Rəhbərlik", icon: UserCog },
  { href: "/depo", label: "Depo", icon: Warehouse, depot: true },
  { href: "/xeta-kodlari", label: "Xəta kodları", icon: TriangleAlert },
];

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  return pathname.startsWith(href);
}

// Depo yalnız depo məsulu (və müdir) üçün görünür: showDepot serverdə can_manage_tools() ilə təyin olunur
function Nav({ pathname, showDepot = false }: { pathname: string | null; showDepot?: boolean }) {
  return (
    <nav className="flex items-center gap-1">
      {NAV.filter((n) => !n.depot || showDepot).map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="nav-link" aria-current={isActive(href, pathname) ? "page" : undefined}>
          <Icon size={16} strokeWidth={2.2} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

// Suspense fallback: aktiv bənd seçilməmiş menyu
export function NavLinksFallback() {
  return <Nav pathname={null} />;
}

export function NavLinks({ showDepot }: { showDepot: boolean }) {
  return <Nav pathname={usePathname()} showDepot={showDepot} />;
}
