// Elanın saatı (Bakı vaxtı): "22:05"
const time = new Intl.DateTimeFormat("az", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit", hour12: false });

export const timeText = (iso: string) => time.format(new Date(iso));
