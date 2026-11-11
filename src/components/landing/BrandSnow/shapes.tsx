// Dörd cür qar kristalı (viewBox -10 -10 20 20, rəng `currentColor`): budaqlı, ucları dənəli, altıbucaqlı və parıltı ulduzu
const ARMS = [0, 60, 120, 180, 240, 300];

const Arms = ({ children }: { children: React.ReactNode }) => (
  <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
    {ARMS.map((a) => <g key={a} transform={`rotate(${a})`}>{children}</g>)}
  </g>
);

export const SHAPES = [
  // 0: klassik budaqlı kristal
  <Arms key="0"><path d="M0 0V-9M0 -5.5L-2.8 -8M0 -5.5L2.8 -8M0 -3L-1.8 -4.6M0 -3L1.8 -4.6" /></Arms>,
  // 1: uclarında dənə olan ulduz
  <g key="1"><Arms><path d="M0 0V-6.4" /></Arms>{ARMS.map((a) => <circle key={a} r="1.7" cy="-7.6" transform={`rotate(${a})`} fill="currentColor" />)}</g>,
  // 2: altıbucaqlı lövhə (daxilində kiçik kristal)
  <g key="2"><path d="M0 -8L6.9 -4V4L0 8L-6.9 4V-4Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /><Arms><path d="M0 0V-4.6" /></Arms></g>,
  // 3: dörd şüalı parıltı (dolu)
  <path key="3" d="M0 -9C.9 -2.4 2.4 -.9 9 0C2.4 .9 .9 2.4 0 9C-.9 2.4 -2.4 .9 -9 0C-2.4 -.9 -.9 -2.4 0 -9Z" fill="currentColor" />,
];
