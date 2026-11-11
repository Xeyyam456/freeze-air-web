import { bodyPath, bubbles, dropTips, frostPath, ICE_H, makeIcicles, rimPath, TILE, tipOf, type Icicle } from "./icicles";
import s from "./HeaderIcicles.module.css";

const LIST = makeIcicles();
const BACK = LIST.filter((c) => c.back);
const FRONT = LIST.filter((c) => !c.back);
const TIPS = dropTips(LIST);

// Bir saçaq: şəffaf şüşə gövdə (kənarları parlaq, ortası aydın), kənar parıltıları, içində qabarcıqlar, ucunda yumru damcı
function Stalk({ c }: { c: Icicle }) {
  const tip = tipOf(c);
  return (
    <g>
      <path d={bodyPath(c)} fill="url(#ice-body)" stroke="#5f9bc0" strokeOpacity="0.55" strokeWidth="0.7" />
      <ellipse cx={c.x} cy="0.8" rx={c.hw * 1.45 + 1} ry="2.2" fill="#eaf8ff" fillOpacity="0.9" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.7" />
      <g fill="none" strokeLinecap="round">
        <path d={rimPath(c, -1)} stroke="#fff" strokeOpacity="0.95" strokeWidth="1.2" />
        <path d={rimPath(c, 1)} stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
      </g>
      {bubbles(c).map((b, k) => <ellipse key={k} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill="#fff" fillOpacity="0.55" />)}
      <ellipse cx={tip.x} cy={tip.y + tip.r * 0.7} rx={tip.r} ry={tip.r * 1.25} fill="url(#ice-bulb)" stroke="#fff" strokeOpacity="0.75" strokeWidth="0.6" />
      <circle cx={tip.x - tip.r * 0.3} cy={tip.y + tip.r * 0.2} r={tip.r * 0.28} fill="#fff" fillOpacity="0.95" />
    </g>
  );
}

// Header-in alt kənarından tək-tək asılan real buz saçaqları (nümunə foto əsasında): uzun, nazik, şəffaf, yavaş daralan,
// kənarları parlaq, içində hava qabarcıqları, ucunda yumru damcı; arxada solğun-bulanıq qısa saçaqlar (dərinlik). Uzun
// saçaqların ucunda damcı yığılır, ağırlaşır və qopub hero-nun içinə sürətlə düşür (iz qoymur: real damcı kimi).
// SVG + CSS, JS yoxdur; temperatur sürgüsünə bağlıdır (soyuqda uzanır, 24°-dən sonra əriyib 30°-də tam itir).
export function HeaderIcicles() {
  return (
    // .away: səhifə aşağı sürüşdükcə saçaqlar tədricən yuxarı qalxıb solur, hero ekrandan çıxanda tam yoxdur (CSS scroll-driven).
    // Sarğı header ölçüsündədir (absolute inset-0): içindəki "top-full" və damcıların mövqeyi dəyişmir.
    <div aria-hidden="true" className={s.away}>
      <div className={`${s.ice} pointer-events-none absolute inset-x-0 top-full`}>
        <svg width="100%" height={ICE_H} className="block overflow-visible">
          <defs>
            <linearGradient id="ice-body" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#dff1fb" stopOpacity="0.8" />
              <stop offset="0.14" stopColor="#a9d3ec" stopOpacity="0.4" />
              <stop offset="0.5" stopColor="#7fb2d4" stopOpacity="0.16" />
              <stop offset="0.86" stopColor="#a4cde8" stopOpacity="0.42" />
              <stop offset="1" stopColor="#e6f5fd" stopOpacity="0.8" />
            </linearGradient>
            <radialGradient id="ice-bulb" cx="0.4" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="0.5" stopColor="#bfe3f6" stopOpacity="0.55" />
              <stop offset="1" stopColor="#7fb8dc" stopOpacity="0.5" />
            </radialGradient>
            <filter id="ice-blur"><feGaussianBlur stdDeviation="0.9" /></filter>
            {/* Naxış rəsm sahəsindən 12 px hündürdür: yoxsa miqyaslananda növbəti təkrarın yuxarı cərgəsi (ağ qapaqlar)
                alt kənarda qırıq-qırıq xətt kimi görünür */}
            <pattern id="ice-tile" width={TILE} height={ICE_H + 12} patternUnits="userSpaceOnUse">
              <g opacity="0.55" filter="url(#ice-blur)">{BACK.map((c) => <Stalk key={c.i} c={c} />)}</g>
              {FRONT.map((c) => <Stalk key={c.i} c={c} />)}
              <path d={frostPath()} fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="0.8" strokeLinecap="round" />
            </pattern>
          </defs>
          <rect width="100%" height={ICE_H} fill="url(#ice-tile)" />
        </svg>
      </div>
      {/* Damcı: ucda yığılır, ağırlaşır, qopan kimi sərbəst düşür (iz qoymur) */}
      {TIPS.map((t) => (
        <span
          key={t.i} aria-hidden="true" className={s.fall}
          style={{ left: t.x, "--len": t.y, "--t": `${8 + t.i * 1.4}s`, "--d": `${t.i * 2.3}s` } as React.CSSProperties}
        >
          <i className={s.bead} />
        </span>
      ))}
    </div>
  );
}
