"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { WorkLogForm } from "./WorkLogForm";

// İş yazılanda (həm burada, həm başqa yerdə) bu hadisə atılır: sayğac və iş siyahısı yenilənir
export const WORK_SAVED = "work-saved";

// Yerli tarix "YYYY-MM-DD"
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Mənim bugünüm: bugün neçə iş yazılıb və bir kliklə "İş əlavə et". Əməkdaş kartı olmayan hesabda (məs. yalnız admin) görünmür.
export function MyDay() {
  // undefined = yüklənir, null = əməkdaş kartı yoxdur
  const [me, setMe] = useState<{ id: number; name: string } | null | undefined>(undefined);
  const [count, setCount] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: id } = await supabase.rpc("my_employee_id");
      if (!id) {
        if (!cancelled) setMe(null);
        return;
      }
      const { data: emp } = await supabase.from("employees").select("full_name").eq("id", id).maybeSingle();
      if (!cancelled) setMe({ id, name: emp?.full_name ?? "" });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onSaved = () => setTick((t) => t + 1);
    window.addEventListener(WORK_SAVED, onSaved);
    return () => window.removeEventListener(WORK_SAVED, onSaved);
  }, []);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    createClient()
      .from("work_logs")
      .select("id", { count: "exact", head: true })
      .eq("employee_id", me.id)
      .eq("work_date", todayIso())
      .then(({ count: n }) => {
        if (!cancelled) setCount(n ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [me, tick]);

  if (me === null) return null;

  return (
    <section className="card flex items-center gap-4 !py-4">
      {adding && me && (
        <WorkLogForm
          employeeId={me.id}
          employeeName={me.name}
          onClose={() => setAdding(false)}
          onSaved={() => window.dispatchEvent(new Event(WORK_SAVED))}
        />
      )}
      <span className="icon-tile shrink-0"><CalendarCheck size={20} /></span>
      <div className="min-w-0 flex-1">
        <p className="muted text-xs font-semibold uppercase tracking-wide">Mənim bugünüm</p>
        <p className="text-lg font-bold">
          {count === null ? "…" : count === 0 ? "Hələ iş yazmamısan" : <><span className="text-primary">{count}</span> iş yazılıb</>}
        </p>
      </div>
      <button type="button" disabled={!me} onClick={() => setAdding(true)} className="btn btn-primary">
        <Plus size={16} /> İş əlavə et
      </button>
    </section>
  );
}
