import { Suspense } from "react";
import { ClipboardList, MapPin, Warehouse, Wrench } from "lucide-react";
import { Page } from "@/components/Page";
import { Avatar } from "@/components/employees/EmployeeList";
import { createClient } from "@/lib/supabase/server";

// Bakı vaxtı ilə ("YYYY-MM-DD"): server başqa saat qurşağında ola bilər
function bakuDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baku" }).format(date);
}

function bakuTime(iso: string) {
  return new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

function dayLabel(workDate: string) {
  const today = bakuDay();
  if (workDate === today) return "Bu gün";
  if (workDate === bakuDay(new Date(Date.now() - 86400000))) return "Dünən";
  return workDate.split("-").reverse().join(".");
}

type LogRow = {
  id: number;
  work_date: string;
  created_at: string;
  description: string;
  place_text: string | null;
  employees: { full_name: string; photo_url: string | null } | null;
  stores: { name: string; companies: { name: string } | null } | null;
  companies: { name: string } | null;
};

// İş yeri: mağaza/filial (şirkətin adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer
function placeOf(l: LogRow) {
  if (l.stores) return `${l.stores.companies?.name ?? ""} · ${l.stores.name}`;
  if (l.companies) return l.companies.name;
  return l.place_text ?? "—";
}

// Son görülən işlər: kim, harada, nə iş görüb (bütün ustalar)
async function WorkLogs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("work_logs")
    .select("id, work_date, created_at, description, place_text, employees(full_name, photo_url), stores(name, companies(name)), companies(name)")
    .order("created_at", { ascending: false })
    .limit(30);
  const logs = (data ?? []) as LogRow[];

  if (logs.length === 0) {
    return (
      <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-line text-center">
        <p className="muted text-sm">Hələ iş qeydi yoxdur.</p>
      </div>
    );
  }
  return (
    <ul className="nice-scroll -mr-2 min-h-0 flex-1 divide-y divide-line overflow-y-auto pr-2">
      {logs.map((l) => (
        <li key={l.id} className="flex items-start gap-3 py-3">
          <Avatar employee={{ full_name: l.employees?.full_name ?? "?", photo_url: l.employees?.photo_url ?? null }} className="!h-10 !w-10 shrink-0 !text-xs" />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-2 text-sm">
              <span className="font-semibold">{l.employees?.full_name ?? "—"}</span>
              <span className="flex min-w-0 items-center gap-1 text-xs font-semibold text-primary"><MapPin size={12} className="shrink-0" /> <span className="truncate">{placeOf(l)}</span></span>
            </p>
            <p className="muted mt-0.5 text-sm">{l.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold tabular-nums">{bakuTime(l.created_at)}</p>
            <p className="muted text-[11px]">{dayLabel(l.work_date)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// Alətlər: öz üzərindəkilər + depoda ümumi vəziyyət
async function Tools() {
  const supabase = await createClient();
  const { data: myId } = await supabase.rpc("my_employee_id");
  const [{ data: mine }, { data: stock }] = await Promise.all([
    myId
      ? supabase.from("tool_assignments").select("id, quantity, taken_at, tools(name)").eq("employee_id", myId).is("returned_at", null).order("taken_at")
      : Promise.resolve({ data: [] }),
    supabase.from("tool_stock").select("quantity, given_out"),
  ]);
  const total = (stock ?? []).reduce((s, t) => s + t.quantity, 0);
  const out = (stock ?? []).reduce((s, t) => s + t.given_out, 0);

  return (
    <>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Sənin üzərində</h3>
      {!mine || mine.length === 0 ? (
        <p className="muted rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm">Üzərində alət yoxdur.</p>
      ) : (
        <ul className="nice-scroll -mr-2 max-h-72 space-y-1.5 overflow-y-auto pr-2">
          {mine.map((a) => (
            <li key={a.id} className="flex items-center gap-2.5 rounded-lg bg-bg px-3 py-2 text-sm font-medium">
              <Wrench size={14} className="shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate">{a.tools?.name}</span>
              {a.quantity > 1 && <span className="rounded-full bg-primary-soft px-1.5 text-xs font-bold text-primary">×{a.quantity}</span>}
            </li>
          ))}
        </ul>
      )}

      <h3 className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-muted">Depo</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Cəmi", value: total, tone: "" },
          { label: "Ustalarda", value: out, tone: "text-primary" },
          { label: "Depoda", value: total - out, tone: "text-ok" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-bg px-2 py-2.5">
            <p className={`text-xl font-extrabold tabular-nums ${s.tone}`}>{s.value}</p>
            <p className="muted text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </>
  );
}

const loading = <p className="muted text-sm">Yüklənir...</p>;

export default function Home() {
  return (
    <Page title="Panel" subtitle="Görülən işlər və alətlər">
      <div className="grid h-[calc(100vh-var(--header-h)-2*var(--gap))] grid-cols-[1.6fr_1fr] gap-5">
        <section className="card flex min-h-0 flex-col">
          <h2 className="card-title mb-2 flex items-center gap-2"><ClipboardList size={18} className="text-primary" /> Görülən işlər</h2>
          <Suspense fallback={loading}>
            <WorkLogs />
          </Suspense>
        </section>

        <section className="card flex min-h-0 flex-col overflow-y-auto">
          <h2 className="card-title mb-3 flex items-center gap-2"><Warehouse size={18} className="text-primary" /> Alətlər</h2>
          <Suspense fallback={loading}>
            <Tools />
          </Suspense>
        </section>
      </div>
    </Page>
  );
}
