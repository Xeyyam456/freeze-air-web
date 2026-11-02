import s from "./Page.module.css";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MenuButton } from "../panel/TopbarTools";
import type { PageProps } from "@/types/shared";

// Səhifə şablonu: yuxarıda yapışan nazik zolaq (başlıq + səhifənin düymələri), altında məzmun.
// Sol menyu panel layout-undadır (components/panel/Sidebar.tsx).
export function Page({ title, subtitle, back, actions, children }: PageProps) {
  return (
    <>
      <header className={s.topbar}>
        <div className="flex h-full items-center gap-3 px-[var(--gutter)] lg:gap-4">
          <MenuButton />
          {back && (
            <Link href={back.href} className={s.back} title={back.label} aria-label={`${back.label} siyahısına qayıt`}>
              <ChevronLeft size={18} />
            </Link>
          )}
          <div className={`${s.title} min-w-0 flex-1`}>
            <h1 className="truncate">{title}</h1>
            {subtitle && <p className="truncate max-sm:hidden">{subtitle}</p>}
          </div>
          {actions}
        </div>
      </header>
      <main className={`${s.main} px-[var(--gutter)]`}>{children}</main>
    </>
  );
}
