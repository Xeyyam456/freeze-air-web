// Hazır illüstrasiyası olan avadanlıq key-ləri (digərlərinə admin şəkil yükləyir).
// Ayrıca faylda: client komponentlər (məs. EquipmentShowcase) də işlədir, site-content.ts isə server-only keş kodudur.
export const ILLUSTRATED_KEYS = ["split", "cassette", "floor", "ducted", "outdoor"] as const;
export type IllustratedKey = (typeof ILLUSTRATED_KEYS)[number];
export const isIllustrated = (key: string): key is IllustratedKey => (ILLUSTRATED_KEYS as readonly string[]).includes(key);
