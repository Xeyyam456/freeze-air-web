import { CountUp } from "@/components/landing/CountUp";
import { getStats } from "@/lib/site-trust";

// Rəqəmlər zolağı: hero-nun üstünə yarı çıxan ağ kart. Ən azı 2 aktiv rəqəm olanda göstərilir.
export async function StatsStrip() {
  const stats = (await getStats()).slice(0, 4);
  if (stats.length < 2) return null;
  // 2–3 rəqəm hər ekranda bir sırada (2 sütuna düzüləndə biri tək qalırdı); 4 rəqəm mobildə 2×2
  const cols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" }[stats.length as 2 | 3 | 4];
  return (
    <div className="site-wrap relative z-10 -mt-12 lg:-mt-14">
      {/* Şüşə kart: hero-nun üstündə bulanıq ağ; hər rəqəmin altında sayğacla birlikdə dolan xətt (.stat-bar) */}
      <div className="hero-in rounded-[28px] bg-white/80 p-3 shadow-[0_24px_60px_rgba(6,25,43,0.18)] ring-1 ring-white/60 backdrop-blur-xl" style={{ "--d": "700ms" } as React.CSSProperties}>
        <dl className={`grid gap-y-2 ${cols}`}>
          {stats.map((s, i) => (
            <div key={s.id} className={`flex flex-col items-center px-2 py-5 text-center sm:px-6 ${i > 0 ? "sm:border-l sm:border-night/10" : ""}`}>
              <dt className="order-3 mt-1.5 text-sm font-semibold text-night/55">{s.label}</dt>
              <dd className="font-display text-3xl font-bold text-cold sm:text-4xl"><CountUp value={s.value} /></dd>
              <span className="stat-bar order-2 mt-2" style={{ "--d": `${900 + i * 150}ms` } as React.CSSProperties} aria-hidden="true" />
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
