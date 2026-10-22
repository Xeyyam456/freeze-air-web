"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, Snowflake, X } from "lucide-react";
import { useMyOpenTasks } from "@/lib/tasks-live";
import { LogoutButton } from "@/components/LogoutButton";
import { ProfileButton, type Me } from "@/components/ProfileButton";
import { isActive, navGroups, PANEL_EVENTS } from "./nav";

export const NAV_STORAGE_KEY = "panel-nav";

// Menyunu yığ/aç: vəziyyət <html data-nav="mini">-dədir (ilk boyamadan əvvəl root layout-dakı skript qoyur), localStorage-da saxlanır
function toggleMini() {
  const html = document.documentElement;
  const mini = html.dataset.nav !== "mini";
  if (mini) html.dataset.nav = "mini";
  else delete html.dataset.nav;
  try {
    localStorage.setItem(NAV_STORAGE_KEY, mini ? "mini" : "full");
  } catch {}
}

// Sol menyu: loqo, qruplu bəndlər (tapşırıq nişanı ilə), altda profil və çıxış.
// ≥ 1024: sabit, yığıla bilir (yalnız ikonlar); < 1024: üst zolaqdakı ☰ ilə açılan çəkmə panel (səhifə dəyişəndə özü bağlanır).
function SidebarView({ showDepot, me, pathname }: { showDepot: boolean; me: Me | null; pathname: string | null }) {
  const openTasks = useMyOpenTasks();
  const [openAt, setOpenAt] = useState<string | null>(null); // mobil panel hansı səhifədə açılıb
  const open = openAt !== null && openAt === pathname;

  useEffect(() => {
    const onMenu = () => setOpenAt(window.location.pathname);
    window.addEventListener(PANEL_EVENTS.menu, onMenu);
    return () => window.removeEventListener(PANEL_EVENTS.menu, onMenu);
  }, []);

  return (
    <>
      {open && <div className="panel-nav-scrim" onClick={() => setOpenAt(null)} aria-hidden />}
      <aside className={`panel-nav ${open ? "is-open" : ""}`} aria-label="Panel menyusu">
        <div className="panel-nav-head">
          <Link href="/panel" className="flex min-w-0 items-center gap-3" title="Freeze Air Service — Panel">
            <span className="logo-mark"><Snowflake size={22} strokeWidth={2.4} /></span>
            <span className="nav-label min-w-0 leading-tight">
              <span className="block truncate text-[15px] font-extrabold">Freeze Air</span>
              <span className="block text-xs text-white/55">Usta paneli</span>
            </span>
          </Link>
          <button type="button" onClick={() => setOpenAt(null)} className="nav-icon-btn ml-auto lg:hidden" aria-label="Menyunu bağla">
            <X size={18} />
          </button>
        </div>

        <nav className="panel-nav-scroll">
          {navGroups(showDepot).map((g) => (
            <div key={g.title} className="nav-group">
              <p className="nav-group-title"><span className="nav-label">{g.title}</span></p>
              {g.items.map(({ href, label, icon: Icon, tasks }) => (
                <Link key={href} href={href} className="nav-item" title={label}
                  aria-current={isActive(href, pathname) ? "page" : undefined}>
                  <Icon size={19} strokeWidth={2.1} className="shrink-0" />
                  <span className="nav-label truncate">{label}</span>
                  {tasks && openTasks > 0 && (
                    <span className="nav-badge" title="Bu gün görülməmiş tapşırığın">{openTasks}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="panel-nav-foot">
          {me ? (
            <div className="nav-profile">
              <ProfileButton me={me} />
              <LogoutButton />
            </div>
          ) : (
            <div className="nav-profile h-[52px]" />
          )}
          <button type="button" onClick={toggleMini} className="nav-item nav-collapse max-lg:!hidden" title="Menyunu yığ / aç">
            <ChevronsLeft size={19} className="shrink-0" />
            <span className="nav-label">Menyunu yığ</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// Suspense fallback: usePathname() dinamik marşrutda (/magazalar/[id]) prerender-i bloklayır (Vercel build xətası), ona görə aktiv bənd seçilməmiş menyu
export function SidebarFallback() {
  return <SidebarView showDepot={false} me={null} pathname={null} />;
}

export function Sidebar({ showDepot, me }: { showDepot: boolean; me: Me | null }) {
  return <SidebarView showDepot={showDepot} me={me} pathname={usePathname()} />;
}
