"use client";

import { Users } from "lucide-react";
import type { EmployeeListProps } from "@/types/employees";
import { useEmployeeFilter } from "../../hooks/useEmployeeFilter";
import { EmployeeCard } from "../EmployeeCard";
import { EmployeeSearch } from "./EmployeeSearch";
import { Card } from "@/shared/components/Card";

// Ustalar: yapışan axtarış, profil kartları (tünd xülasə 2026-10-28 silindi, admin kimi). Daxil olmuş usta öz kartını ən başda görür.
export function EmployeeList({ employees, todayWork, monthWork, status, myEmployeeId }: EmployeeListProps) {
  const { query, setQuery, filtered } = useEmployeeFilter(employees, myEmployeeId);

  if (employees.length === 0) {
    return (
      <Card className="py-12 text-center">
        <span className="icon-tile mx-auto"><Users size={20} /></span>
        <p className="mt-3 font-semibold">Hələ usta yoxdur</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <EmployeeSearch value={query} onChange={setQuery} placeholder="Ad, ixtisas və ya telefon ilə axtar..." label="Usta axtarışı" />

      {filtered.length === 0 ? (
        <Card className="muted py-10 text-center text-sm">Bu axtarışa uyğun usta tapılmadı.</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => (
            <EmployeeCard key={e.id} employee={e} todayCount={todayWork[e.id] ?? 0} monthCount={monthWork[e.id] ?? 0}
              status={status[e.id]} isMe={e.id === myEmployeeId} />
          ))}
        </div>
      )}
    </div>
  );
}
