import { Users } from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";
import { getPublicEmployees } from "@/lib/public-employees";
import type { TextsProps, WorkerKind } from "@/types/site";
import { WORKER_TYPES } from "../constants/workerTypes";
import { MasterCard } from "./MasterCard";
import { TeamPanel } from "./TeamPanel";

// Solda yapışan tünd panel, sağda iki sütunlu usta kartları.
// Rəhbərlik kartları istifadəçi istəyi ilə çıxarılıb (2026-10-20); iri portret kartlar da bəyənilmədi.
export async function TeamSection({ t }: TextsProps) {
  const employees = await getPublicEmployees();

  if (employees.length === 0) {
    return (
      <div className="site-wrap">
        <div className="rounded-[28px] bg-white p-12 text-center text-night/60">
          <Users size={28} className="mx-auto text-cold" />
          <p className="mt-3">{t["team.empty"]}</p>
        </div>
      </div>
    );
  }

  const max = Math.max(...employees.map((e) => e.months));
  const counts = Object.fromEntries(WORKER_TYPES.map((ty) => [ty.key, employees.filter((e) => e.worker_type === ty.key).length])) as Record<WorkerKind, number>;

  return (
    // grid-cols-[minmax(0,1fr)]: sütun məzmunun eninə görə genişlənməsin (mobildə 409px-dən aşağı daralmırdı, səhifə daşırdı)
    <section className="site-wrap grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <TeamPanel t={t} counts={counts} />
      {/* Usta kartları: 768–1023 və ≥ 1280 iki sütun; 1024–1279 bir (panelin yanında dar), < 768 bir */}
      <div className="grid gap-5 md:max-lg:grid-cols-2 xl:grid-cols-2">
        {employees.map((e, i) => (
          <Reveal key={e.id} delay={(i % 2) * 100} className="h-full">
            <MasterCard e={e} max={max} t={t} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
