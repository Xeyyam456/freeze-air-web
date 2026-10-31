import { useMemo, useState } from "react";
import { norm } from "@/shared/utils/norm";
import type { Employee } from "@/types/employees";

// Axtarış (ad, ixtisas, telefon); daxil olmuş usta öz kartını ən başda görür
export function useEmployeeFilter(employees: Employee[], myEmployeeId: number | null) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return employees
      .filter((e) => {
        const haystack = norm(`${e.full_name} ${e.specialty} ${e.phone}`);
        return words.every((w) => haystack.includes(w));
      })
      .sort((a, b) => Number(b.id === myEmployeeId) - Number(a.id === myEmployeeId));
  }, [employees, query, myEmployeeId]);

  return { query, setQuery, filtered };
}
