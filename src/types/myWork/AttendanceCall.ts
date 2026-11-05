// Davamiyyət əməliyyatı (check_in, check_out...): bazanın yazdığı saat və ya xəta mətni
export type AttendanceCall = () => Promise<{ time: string | null; error: string | null }>;
