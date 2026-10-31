import { useState } from "react";
import { PersonCard } from "@/shared/components/PersonCard";
import type { EmployeeCardProps } from "@/types/employees";
import { EmployeeDetailsModal } from "../EmployeeDetailsModal";

export function EmployeeCard({ employee, todayCount, monthCount, status, isMe }: EmployeeCardProps) {
  const [viewing, setViewing] = useState(false);

  return (
    <>
      {viewing && <EmployeeDetailsModal employee={employee} isMe={isMe} onClose={() => setViewing(false)} />}
      <PersonCard
        person={employee}
        subtitle={employee.specialty ?? "İxtisas yazılmayıb"}
        badge={isMe ? "Sən" : undefined}
        highlight={isMe}
        status={status}
        stats={[
          { label: "Bu gün iş", value: todayCount, tone: todayCount ? "text-ok" : "" },
          { label: "Bu ay iş", value: monthCount, tone: monthCount ? "text-primary" : "" },
        ]}
        onOpen={() => setViewing(true)}
      />
    </>
  );
}
