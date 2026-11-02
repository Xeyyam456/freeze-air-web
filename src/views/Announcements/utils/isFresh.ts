// Son 24 saatın elanı: "Yeni" nişanı
export const isFresh = (iso: string, now = Date.now()) => now - Date.parse(iso) < 86_400_000;
