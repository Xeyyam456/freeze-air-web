import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { QuickActions } from "@/components/panel/QuickActions";
import { Sidebar, SidebarFallback } from "@/components/panel/Sidebar";
import { TasksListener } from "@/components/work/TasksListener";

// Sol menyu + qlobal pəncərələr: Depo bəndi yalnız depo məsulu (və müdir) üçün; altda profil (ad, rol, şəkil)
async function PanelChrome() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const uid = String(data?.claims.sub ?? "");
  const email = String(data?.claims.email ?? "");
  const [{ data: canManageTools }, { data: admin }, { data: employee }, { data: profile }] = await Promise.all([
    supabase.rpc("can_manage_tools"),
    supabase.rpc("is_admin"),
    supabase.from("employees").select("id, full_name, position, photo_url").eq("user_id", uid).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle(),
  ]);
  const name = employee?.full_name ?? profile?.full_name ?? (admin ? "Admin" : email);
  const role = admin ? (employee?.position ?? "Administrator") : employee ? "Usta" : "İstifadəçi";
  const showDepot = canManageTools === true;

  return (
    <>
      <Sidebar showDepot={showDepot} me={{ employeeId: employee?.id ?? null, name, role, email, photoUrl: employee?.photo_url ?? null }} />
      <QuickActions showDepot={showDepot} />
    </>
  );
}

// Usta panelinin bütün səhifələri: sol menyu səhifələr arası keçiddə qalır, tapşırıqlar Realtime ilə dinlənir
export default function PanelLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <TasksListener />
      <Suspense fallback={<SidebarFallback />}>
        <PanelChrome />
      </Suspense>
      <div className="panel-body">{children}</div>
    </>
  );
}
