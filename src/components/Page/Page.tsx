import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MenuButton, TopbarTools } from "../panel/TopbarTools";
import type { PageProps } from "@/types/shared";

// Səhifə şablonu: yuxarıda yapışan nazik zolaq (başlıq + səhifənin düymələri + axtarış və "İş əlavə et"), altında məzmun.
// Sol menyu panel layout-undadır (components/panel/Sidebar.tsx).
export function Page({ title, subtitle, back, actions, children }: PageProps) {
  return (
    <>
      <header className="app-topbar">
        <div className="app-shell flex h-full items-center gap-3 lg:gap-4">
          <MenuButton />
          {back && (
            <Link href={back.href} className="hero-back" title={back.label} aria-label={`${back.label} siyahısına qayıt`}>
              <ChevronLeft size={18} />
            </Link>
          )}
          <div className="page-title min-w-0 flex-1">
            <h1 className="truncate">{title}</h1>
            {subtitle && <p className="truncate max-sm:hidden">{subtitle}</p>}
          </div>
          {actions}
          <TopbarTools />
        </div>
      </header>
      <main className="app-shell app-main">{children}</main>
    </>
  );
}
