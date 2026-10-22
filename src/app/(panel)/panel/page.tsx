import { Suspense } from "react";
import { Page } from "@/components/Page";
import { ToolsPanel, type HolderPerson, type StockItem } from "@/components/depot/ToolsPanel";
import { MyDay } from "@/components/work/MyDay";
import { WorkHistory } from "@/components/work/WorkHistory";
import { createClient } from "@/lib/supabase/server";

// Depo: alətlər və materiallar (iki tab, Depo-dakı kimi): stok vəziyyəti + hansı ustada nə var
async function Tools() {
  const supabase = await createClient();
  const [{ data: myId }, { data: held }, { data: stock }] = await Promise.all([
    supabase.rpc("my_employee_id"),
    supabase
      .from("tool_assignments")
      .select("id, quantity, employee_id, employees(full_name, photo_url), tools(name, kind, unit, pack_name, pack_size)")
      .is("returned_at", null),
    supabase.from("tool_stock").select("name, quantity, given_out, available, kind, unit, pieces_count, pieces_total, pack_name, pack_size").order("name"),
  ]);

  // Usta üzrə qruplaşdırma; öz kartın birinci, qalanı əlifba ilə
  const byEmployee = new Map<number, HolderPerson>();
  for (const a of held ?? []) {
    const e = byEmployee.get(a.employee_id) ?? { id: a.employee_id, name: a.employees?.full_name ?? "—", photo: a.employees?.photo_url ?? null, items: [] };
    e.items.push({ id: a.id, name: a.tools?.name ?? "—", quantity: a.quantity, material: a.tools?.kind === "material", unit: a.tools?.unit ?? "ədəd", pack_name: a.tools?.pack_name ?? null, pack_size: a.tools?.pack_size ?? null });
    byEmployee.set(a.employee_id, e);
  }
  const people = [...byEmployee.values()].sort((a, b) => (a.id === myId ? -1 : b.id === myId ? 1 : a.name.localeCompare(b.name, "az")));

  return <ToolsPanel stock={(stock ?? []) as StockItem[]} people={people} myId={myId ?? null} />;
}

const loading = <p className="muted text-sm">Yüklənir...</p>;

export default function Home() {
  return (
    <Page title="Panel" subtitle="Görülən işlər və alətlər">
      <div className="grid h-[calc(100vh-var(--header-h)-2*var(--gap))] grid-cols-[1.6fr_1fr] gap-5">
        {/* Sol: mənim bugünüm + görülən işlər (tarixçə) */}
        <div className="flex min-h-0 flex-col gap-5">
          {/* MyDay render zamanı tarixi oxuyur (davamiyyət): Next 16 bunu Suspense daxilində tələb edir */}
          <Suspense fallback={<div className="card h-[118px]" />}>
            <MyDay />
          </Suspense>
          <section className="card flex min-h-0 flex-1 flex-col">
            {/* Tarix render zamanı oxunur (new Date): Next 16 bunu Suspense daxilində tələb edir */}
            <Suspense fallback={loading}>
              <WorkHistory />
            </Suspense>
          </section>
        </div>

        {/* Sağ: alətlər */}
        <div className="flex min-h-0 flex-col gap-5">
          {/* Depo: tünd kart (Statistika üslubunda), başlıq ToolsPanel-in içindədir */}
          <section className="card flex min-h-0 flex-1 flex-col !border-transparent !bg-[#0c1b36] text-white">
            <Suspense fallback={<p className="text-sm text-white/50">Yüklənir...</p>}>
              <Tools />
            </Suspense>
          </section>
        </div>
      </div>
    </Page>
  );
}
