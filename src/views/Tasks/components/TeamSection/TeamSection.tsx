import { Users } from "lucide-react";
import type { TeamSectionProps } from "@/types/myTasks";
import { TeamEmployeeCard } from "../TeamEmployeeCard";
import { TeamGroupCard } from "../TeamGroupCard";

// Komanda: digər ustaların tapşırıqları (yalnız baxış)
export function TeamSection({ teams, groups, employees, logOf, onViewLog }: TeamSectionProps) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
        <Users size={17} className="text-muted" /> Komanda
      </h2>
      <div className="flex flex-wrap gap-3">
        {/* Qrup tapşırığı: üzvlər birlikdə, tapşırıq bir sətir */}
        {teams.map((g) => <TeamGroupCard key={g.id} g={g} employees={employees} logOf={logOf} onViewLog={onViewLog} />)}
        {groups.map(({ employee, items }) => <TeamEmployeeCard key={employee.id} employee={employee} items={items} logOf={logOf} onViewLog={onViewLog} />)}
      </div>
    </section>
  );
}
