// İki an arasındakı dəqiqə və qısa müddət yazısı ("1 saat 5 dəq", "12 dəq")
export const mins = (a: string, b: string) => Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));
export const durShort = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} saat ${m % 60} dəq` : `${Math.max(1, m)} dəq`);
