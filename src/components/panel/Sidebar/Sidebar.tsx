"use client";

import type { SidebarViewProps, SidebarProps } from "@/types/panel";
import s from "./Sidebar.module.css";
import { LogoMark } from "@/shared/components/LogoMark";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, Snowflake, X } from "lucide-react";
import { useMyOpenTasks } from "@/lib/tasks-live";
import { LogoutButton } from "@/components/LogoutButton";
import { ProfileButton } from "@/views/Profile/components/ProfileButton";
import { isActive, navGroups, PANEL_EVENTS } from "../nav";
import { toggleMini } from "./toggleMini";

// Sol menyu: loqo, qruplu bəndlər (tapşırıq nişanı ilə), altda profil və çıxış.
// ≥ 1024: sabit, yığıla bilir (yalnız ikonlar); < 1024: üst zolaqdakı ☰ ilə açılan çəkmə panel (səhifə dəyişəndə özü bağlanır).
function SidebarView({ showDepot, showFuel = false, me, pathname }: SidebarViewProps) {
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
      {open && <div className={s.scrim} onClick={() => setOpenAt(null)} aria-hidden />}
      <aside className={`${s.nav} ${open ? "is-open" : ""}`} aria-label="Panel menyusu">
        {/* ≥ 1024: menyunu yığ / aç — sağ kənarda yumru düymə (əvvəl ayaqda ayrıca sətir idi, alçaq ekranda bəndləri sıxışdırırdı) */}
        <button type="button" onClick={toggleMini} className={`${s.edge} max-lg:!hidden`} title="Menyunu yığ / aç" aria-label="Menyunu yığ / aç">
          <ChevronsLeft size={14} strokeWidth={2.6} />
        </button>
        <div className={s.head}>
          <Link href="/panel" className="flex min-w-0 items-center gap-3" title="Freeze Air Service — Panel">
            <LogoMark><Snowflake size={22} strokeWidth={2.4} /></LogoMark>
            <span className="nav-label min-w-0 leading-tight">
              <span className="block truncate text-[15px] font-extrabold">Freeze Air</span>
              <span className="block text-xs text-white/55">Usta paneli</span>
            </span>
          </Link>
          <button type="button" onClick={() => setOpenAt(null)} className={`${s.iconBtn} ml-auto lg:hidden`} aria-label="Menyunu bağla">
            <X size={18} />
          </button>
        </div>

        <nav className={s.scroll}>
          {navGroups(showDepot, showFuel).map((g) => (
            <div key={g.title} className={s.group}>
              <p className={s.groupTitle}><span className="nav-label">{g.title}</span></p>
              {g.items.map(({ href, label, icon: Icon, tasks }) => (
                <Link key={href} href={href} className={s.item} title={label}
                  aria-current={isActive(href, pathname) ? "page" : undefined}>
                  <Icon size={19} strokeWidth={2.1} className="shrink-0" />
                  <span className="nav-label truncate">{label}</span>
                  {tasks && openTasks > 0 && (
                    <span className={s.badge} title="Bu gün görülməmiş tapşırığın">{openTasks}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className={s.foot}>
          {me ? (
            <div className={s.profile}>
              <ProfileButton me={me} />
              <LogoutButton />
            </div>
          ) : (
            <div className={`${s.profile} h-[52px]`} />
          )}
        </div>
      </aside>
    </>
  );
}

// Suspense fallback: usePathname() dinamik marşrutda (/magazalar/[id]) prerender-i bloklayır (Vercel build xətası), ona görə aktiv bənd seçilməmiş menyu
export function SidebarFallback() {
  return <SidebarView showDepot={false} me={null} pathname={null} />;
}

export function Sidebar({ showDepot, showFuel, me }: SidebarProps) {
  return <SidebarView showDepot={showDepot} showFuel={showFuel} me={me} pathname={usePathname()} />;
}
