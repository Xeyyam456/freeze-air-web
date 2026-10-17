import Link from "next/link";
import { Suspense } from "react";
import { Building2, Store, TriangleAlert, UserCog, Users } from "lucide-react";
import { Page } from "@/components/Page";
import { createClient } from "@/lib/supabase/server";

const sections = [
  { href: "/sirketler", title: "Şirkətlər", desc: "Rabitəbank, stadion və s., onların filialları", icon: Building2, ready: true },
  { href: "/magazalar", title: "Mağazalar", desc: "Oba, Araz, ALL və digər marketlərin mağazaları", icon: Store, ready: true },
  { href: "/ustalar", title: "Ustalar", desc: "Ustaların təcrübəsi, ixtisası və əlaqə məlumatı", icon: Users, ready: true },
  { href: "/rehberlik", title: "Rəhbərlik", desc: "Müdir, servis müdiri, maliyyəçi", icon: UserCog, ready: true },
  { href: "/xeta-kodlari", title: "Xəta kodları", desc: "Markalar üzrə xəta kodları və həll yolları", icon: TriangleAlert, ready: false },
];

async function Stats() {
  const supabase = await createClient();
  const head = { count: "exact", head: true } as const;
  const n = (r: { count: number | null }) => r.count ?? 0;

  const [companies, markets, stores, employees] = await Promise.all([
    supabase.from("companies").select("*", head).eq("kind", "company").then(n),
    supabase.from("companies").select("*", head).eq("kind", "market").then(n),
    supabase.from("stores").select("*, companies!inner(kind)", head).eq("companies.kind", "market").then(n),
    supabase.from("employees").select("*", head).then(n),
  ]);

  const items = [
    { label: "Şirkət", value: companies, icon: Building2 },
    { label: "Market", value: markets, icon: Store },
    { label: "Mağaza", value: stores, icon: Store },
    { label: "Əməkdaş", value: employees, icon: Users },
  ];

  return <StatGrid items={items} />;
}

function StatGrid({ items }: { items: { label: string; value: number | string; icon: typeof Store }[] }) {
  return (
    <div className="grid grid-cols-4 gap-5">
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className="card flex items-center gap-4">
          <span className="icon-tile"><Icon size={20} /></span>
          <div>
            <div className="stat-value">{value}</div>
            <div className="muted text-sm font-medium">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const statPlaceholder = ["Şirkət", "Market", "Mağaza", "Əməkdaş"].map((label) => ({ label, value: "–", icon: Store }));

export default function Home() {
  return (
    <Page title="Xoş gəldin" subtitle="Şirkətlər, mağazalar, ustalar və xəta kodları bir yerdə">
      <Suspense fallback={<StatGrid items={statPlaceholder} />}>
        <Stats />
      </Suspense>

      <h2 className="mb-4 mt-10 text-lg font-bold">Bölmələr</h2>
      <div className="grid grid-cols-3 gap-5">
        {sections.map(({ href, title, desc, icon: Icon, ready }) => (
          <Link key={href} href={href} className="card card-link flex gap-4">
            <span className="icon-tile"><Icon size={20} /></span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="card-title">{title}</h3>
                {!ready && (
                  <span className="rounded-full bg-bg px-2 py-0.5 text-xs font-semibold text-muted">Hazırlanır</span>
                )}
              </div>
              <p className="muted mt-1 text-sm">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}
