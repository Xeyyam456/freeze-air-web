import Link from "next/link";
import { Suspense } from "react";
import { Snowflake } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";
import { ProfileButton } from "./ProfileButton";
import { NavLinks, NavLinksFallback } from "./NavLinks";

// Menyu: Depo bəndi yalnız depo məsulu (və müdir) üçün
async function PanelNav() {
  const supabase = await createClient();
  const { data: canManageTools } = await supabase.rpc("can_manage_tools");
  return <NavLinks showDepot={canManageTools === true} />;
}

// Sağ yuxarıdakı profil: əməkdaşın adı, vəzifəsi və şəkli; klik → profil (öz şəklini dəyişmək)
async function UserChip() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = String(data?.claims.email ?? "");
  const [{ data: admin }, { data: employee }, { data: profile }] = await Promise.all([
    supabase.rpc("is_admin"),
    supabase.from("employees").select("id, full_name, position, photo_url").eq("user_id", String(data?.claims.sub ?? "")).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", String(data?.claims.sub ?? "")).maybeSingle(),
  ]);
  const name = employee?.full_name ?? profile?.full_name ?? (admin ? "Admin" : email);
  const role = admin ? (employee?.position ?? "Administrator") : employee ? "Usta" : "İstifadəçi";

  return (
    <div className="user-chip !pl-1">
      <ProfileButton me={{ employeeId: employee?.id ?? null, name, role, email, photoUrl: employee?.photo_url ?? null }} />
      <LogoutButton />
    </div>
  );
}

export function AppHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-sticky">
      <div className="app-topbar">
        <div className="app-shell flex h-[var(--topbar-h)] items-center gap-6 2xl:gap-10">
          <Link href="/panel" className="flex shrink-0 items-center gap-3 whitespace-nowrap">
            <span className="logo-mark"><Snowflake size={22} strokeWidth={2.4} /></span>
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold">Freeze Air Service</span>
              <span className="block text-xs text-white/60">Usta paneli</span>
            </span>
          </Link>
          <Suspense fallback={<NavLinksFallback />}>
            <PanelNav />
          </Suspense>
          <div className="ml-auto">
            <Suspense fallback={<div className="user-chip h-[40px] w-56" />}>
              <UserChip />
            </Suspense>
          </div>
        </div>
      </div>
      <header className="app-header">
        <div className="app-shell relative w-full">{children}</div>
      </header>
    </div>
  );
}
