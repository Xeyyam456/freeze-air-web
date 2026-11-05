import { useData } from "@/lib/useData";
import { fetchAttendanceEmployees } from "@/services/attendance/fetchAttendanceEmployees";

export const ATTENDANCE_EMPLOYEES_KEY = "attendance-employees";

// Funksiyanı birbaşa ötürmə: TanStack kontekst obyektini klient parametrinə verərdi
export const useAttendanceEmployees = () => useData(ATTENDANCE_EMPLOYEES_KEY, () => fetchAttendanceEmployees());
