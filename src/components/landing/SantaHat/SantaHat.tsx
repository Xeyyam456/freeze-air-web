import s from "./SantaHat.module.css";

// Xəz haşiyənin kabarıq kənarı: üst və alt cərgədə kiçik dairələr
const FLUFF = Array.from({ length: 9 }, (_, i) => 6 + i * 4.2);
const POM = [[-3.6, 0], [3.6, 0], [0, -3.6], [0, 3.8], [-2.6, 2.7], [2.6, 2.7], [-2.6, -2.6], [2.6, -2.6]];

// Şaxta baba papağı: loqonun sol-üst küncünə qoyulan SVG. Parça kölgəli və qırışlı qırmızı, qalın kabarıq ağ xəz haşiyə,
// ucu aşağı əyilir və pom-pom oradan sallanır (CSS). Ata element `relative` olmalıdır; papaq kliki tutmur.
export function SantaHat() {
  return (
    <svg aria-hidden="true" viewBox="0 0 56 44" className="pointer-events-none absolute -left-[6px] -top-[19px] z-10 w-[40px] -scale-x-100 -rotate-[14deg] drop-shadow-[0_2px_2px_rgba(6,25,43,0.28)]">
      <defs>
        <linearGradient id="hat-cloth" x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#ff6262" />
          <stop offset="0.5" stopColor="#e12027" />
          <stop offset="1" stopColor="#a50f17" />
        </linearGradient>
        <linearGradient id="hat-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dbe6ee" />
        </linearGradient>
        <radialGradient id="hat-pom" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d3e0ea" />
        </radialGradient>
      </defs>
      <path d="M7 31 C7 15 19 6 31 8 C41 10 48 17 50 28 C45 25 41 27 37 31 Z" fill="url(#hat-cloth)" />
      <path d="M37 31 C41 27 45 25 50 28 C47 29 43 30 40 33 Z" fill="#8f0d14" opacity="0.55" />
      <path d="M12 26 C13 17 19 11 27 10" stroke="#ff9a9a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M23 29 C23 22 26 17 30 14 M31 30 C32 24 36 20 41 19" stroke="#8f0d14" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.35" />
      <g>
        <rect x="3" y="29" width="38" height="10" rx="5" fill="url(#hat-fur)" />
        {FLUFF.map((x) => <circle key={`t${x}`} cx={x} cy="30" r="3.1" fill="#fff" />)}
        {FLUFF.map((x) => <circle key={`b${x}`} cx={x + 1} cy="38.3" r="3" fill="#e6eef4" />)}
        <path d="M5 34.5 C14 36 28 36 39 34.5" stroke="#c9d8e3" strokeWidth="1" fill="none" opacity="0.7" />
      </g>
      <g className={s.pom}>
        <path d="M49 26 L51 26 L51.6 33 L48.4 33 Z" fill="#c4161c" />
        <g transform="translate(50 36)">
          {POM.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="url(#hat-pom)" />)}
          <circle r="4.4" fill="url(#hat-pom)" />
        </g>
      </g>
    </svg>
  );
}
