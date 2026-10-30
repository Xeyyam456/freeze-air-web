// Seansın müddəti: "2 saat 5 dəq" / "40 dəq"
export const durShort = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} saat ${m % 60} dəq` : `${Math.max(1, m)} dəq`);
