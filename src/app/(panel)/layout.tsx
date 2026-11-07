import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { fetchPanelChrome } from "@/services/panel/fetchPanelChrome.server";
import { QueryProvider } from "@/components/panel/QueryProvider";
import { QuickActions } from "@/components/panel/QuickActions";
import { Sidebar, SidebarFallback } from "@/components/panel/Sidebar";
import { TasksListener } from "@/views/Tasks/live/TasksListener";
import { FeedListener } from "@/views/Feed/live/FeedListener";

// PWA: telefonda ana ekrana əlavə olunan usta paneli (manifest və ikonlar: app/panel.webmanifest, app/app-icon)
export const metadata: Metadata = {
  manifest: "/panel.webmanifest",
  appleWebApp: { capable: true, title: "Freeze Air", statusBarStyle: "default" },
  icons: { apple: "/app-icon/180" },
};
export const viewport: Viewport = { themeColor: "#06192b" };

// Sol menyu + qlobal pəncərələr: Depo bəndi yalnız depo məsulu (və müdir) üçün; altda profil (ad, rol, şəkil)
async function PanelChrome() {
  const { email, canManageTools, admin, employee, profile } = await fetchPanelChrome();
  const name = employee?.full_name ?? profile?.full_name ?? (admin ? "Admin" : email);
  const role = admin ? (employee?.position ?? "Administrator") : employee ? "Usta" : "İstifadəçi";
  const showDepot = canManageTools === true;
  const showFuel = employee?.has_car === true; // Yanacaq bəndi yalnız maşını olan ustaya

  return (
    <>
      <Sidebar showDepot={showDepot} showFuel={showFuel} me={{ employeeId: employee?.id ?? null, name, role, email, photoUrl: employee?.photo_url ?? null }} />
      <QuickActions showDepot={showDepot} showFuel={showFuel} />
    </>
  );
}

// Usta panelinin bütün səhifələri: sol menyu səhifələr arası keçiddə qalır, tapşırıqlar Realtime ilə dinlənir
export default function PanelLayout({ children }: LayoutProps<"/">) {
  return (
    <QueryProvider>
      <TasksListener />
      <FeedListener />
      <Suspense fallback={<SidebarFallback />}>
        <PanelChrome />
      </Suspense>
      {/* panel-app: usta paneli tünd temada (globals.css) */}
      <div className="panel-app pl-[var(--nav-w)] transition-[padding-left] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)]">{children}</div>
    </QueryProvider>
  );
}
