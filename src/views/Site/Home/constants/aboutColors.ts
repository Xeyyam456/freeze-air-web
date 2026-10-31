// "Haqqımızda" kartının rəngi (admin panelində seçilir): fon, ikon, alt yazı.
// Admin: pages/Site/constants/homeConstants.ts CARD_COLORS və bazadakı check (night|cold|ice|white) ilə eyni olmalıdır.
export const CARD_COLORS = {
  night: { box: "bg-night text-white", icon: "text-cold", sub: "text-white/60" },
  cold: { box: "bg-cold text-white", icon: "text-white", sub: "text-white/75" },
  ice: { box: "bg-ice text-night", icon: "text-cold", sub: "text-night/60" },
  white: { box: "bg-white text-night", icon: "text-cold", sub: "text-night/60" },
};
