// Obyekt növlərinin rəng tonları (CSS dəyişəni `--tone` kimi ötürülür): market firuzəyi, bank mavi, stadion yaşıl,
// yaşayış kompleksi narıncı. Bölmələr ardıcıllıqla bu tonları alır (sıra ≥ 4 olanda təkrarlanır).
const TONES = ["var(--color-cold)", "var(--color-primary)", "var(--color-ok)", "var(--color-heat)"];

export const tone = (i: number) => ({ "--tone": TONES[i % TONES.length] }) as React.CSSProperties;
