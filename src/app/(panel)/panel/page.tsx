import { Suspense } from "react";
import { Warehouse, Wrench } from "lucide-react";
import { Page } from "@/components/Page";
import { ToolStats, type StockRow } from "@/components/depot/ToolStats";
import { Avatar } from "@/components/employees/EmployeeList";
import { MyDay } from "@/components/work/MyDay";
import { WorkHistory } from "@/components/work/WorkHistory";
import { createClient } from "@/lib/supabase/server";

// Alətlər: depoda ümumi vəziyyət + hansı ustada hansı alət var
async function Tools() {
  const supabase = await createClient();
  const [{ data: myId }, { data: held }, { data: stock }] = await Promise.all([
    supabase.rpc("my_employee_id"),
    supabase
      .from("tool_assignments")
      .select("id, quantity, employee_id, employees(full_name, photo_url), tools(name)")
      .is("returned_at", null),
    supabase.from("tool_stock").select("name, quantity, given_out, available").order("name"),
  ]);

  // Usta üzrə qruplaşdırma; öz kartın birinci, qalanı əlifba ilə
  const byEmployee = new Map<number, { name: string; photo: string | null; tools: { id: number; name: string; quantity: number }[] }>();
  for (const a of held ?? []) {
    const e = byEmployee.get(a.employee_id) ?? { name: a.employees?.full_name ?? "—", photo: a.employees?.photo_url ?? null, tools: [] };
    e.tools.push({ id: a.id, name: a.tools?.name ?? "—", quantity: a.quantity });
    byEmployee.set(a.employee_id, e);
  }
  const people = [...byEmployee.entries()].sort(([ia, a], [ib, b]) => (ia === myId ? -1 : ib === myId ? 1 : a.name.localeCompare(b.name, "az")));

  return (
    <>
      <ToolStats tools={(stock ?? []) as StockRow[]} />

      <h3 className="mb-1 mt-5 text-xs font-bold uppercase tracking-wide text-muted">Kimdə nə var</h3>
      {people.length === 0 ? (
        <p className="muted rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm">Alətlər hamısı depodadır.</p>
      ) : (
        <ul className="nice-scroll -mr-2 min-h-0 flex-1 divide-y divide-line overflow-y-auto pr-2">
          {people.map(([id, p]) => (
            <li key={id} className="flex items-start gap-3 py-3">
              <Avatar employee={{ full_name: p.name, photo_url: p.photo }} className="!h-9 !w-9 shrink-0 !text-xs" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {p.name}
                  {id === myId && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">Sən</span>}
                </p>
                <p className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.tools.map((t) => (
                    <span key={t.id} className="inline-flex items-center gap-1 rounded-lg bg-bg px-2 py-1 text-xs font-medium">
                      <Wrench size={11} className="text-primary" /> {t.name}
                      {t.quantity > 1 && <b className="text-primary">×{t.quantity}</b>}
                    </span>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const loading = <p className="muted text-sm">Yüklənir...</p>;

export default function Home() {
  return (
    <Page title="Panel" subtitle="Görülən işlər və alətlər">
      <div className="grid h-[calc(100vh-var(--header-h)-2*var(--gap))] grid-cols-[1.6fr_1fr] gap-5">
        {/* Sol: mənim bugünüm + görülən işlər (tarixçə) */}
        <div className="flex min-h-0 flex-col gap-5">
          <MyDay />
          <section className="card flex min-h-0 flex-1 flex-col">
            {/* Tarix render zamanı oxunur (new Date): Next 16 bunu Suspense daxilində tələb edir */}
            <Suspense fallback={loading}>
              <WorkHistory />
            </Suspense>
          </section>
        </div>

        {/* Sağ: alətlər */}
        <div className="flex min-h-0 flex-col gap-5">
          <section className="card flex min-h-0 flex-1 flex-col">
            <h2 className="card-title mb-3 flex items-center gap-2"><Warehouse size={18} className="text-primary" /> Alətlər</h2>
            <Suspense fallback={loading}>
              <Tools />
            </Suspense>
          </section>
        </div>
      </div>
    </Page>
  );
}
