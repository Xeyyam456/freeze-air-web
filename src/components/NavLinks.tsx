"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, CalendarCheck, LayoutGrid, ListChecks, Store, TriangleAlert, UserCog, Users, Warehouse } from "lucide-react";
import { useMyOpenTasks } from "@/lib/tasks-live";

const NAV = [
  { href: "/panel", label: "Panel", icon: LayoutGrid },
  { href: "/sirketler", label: "Şirkətlər", icon: Building2 },
  { href: "/magazalar", label: "Mağazalar", icon: Store },
  { href: "/ustalar", label: "Ustalar", icon: Users },
  { href: "/tapshiriqlar", label: "Tapşırıqlar", icon: ListChecks, tasks: true },
  { href: "/davamiyyet", label: "Davamiyyət", icon: CalendarCheck },
  { href: "/statistika", label: "Statistika", icon: BarChart3 },
  { href: "/rehberlik", label: "Rəhbərlik", icon: UserCog },
  { href: "/depo", label: "Depo", icon: Warehouse, depot: true },
  { href: "/xeta-kodlari", label: "Xəta kodları", icon: TriangleAlert },
];

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  return pathname.startsWith(href);
}

// Depo yalnız depo məsulu (və müdir) üçün görünür: showDepot serverdə can_manage_tools() ilə təyin olunur.
// Tapşırıqlar yanında nişan: bugünkü görülməmiş öz tapşırıqlarım (Realtime ilə yenilənir, lib/tasks-live.ts)
function Nav({ pathname, showDepot = false }: { pathname: string | null; showDepot?: boolean }) {
  const openTasks = useMyOpenTasks();
  return (
    <nav className="flex items-center gap-1">
      {NAV.filter((n) => !n.depot || showDepot).map(({ href, label, icon: Icon, tasks }) => (
        <Link key={href} href={href} className="nav-link" aria-current={isActive(href, pathname) ? "page" : undefined}>
          <Icon size={16} strokeWidth={2.2} />
          {label}
          {tasks && openTasks > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-none text-white" title="Bu gün görülməmiş tapşırığın">
              {openTasks}
            </span>
          )}
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
