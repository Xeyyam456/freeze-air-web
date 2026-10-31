import { useState } from "react";
import { PersonCard } from "@/shared/components/PersonCard";
import type { ManagerProps } from "@/types/management";
import { ManagerDetailsModal } from "../ManagerDetailsModal";

export function ManagerCard({ manager }: ManagerProps) {
  const [viewing, setViewing] = useState(false);
  return (
    <>
      {viewing && <ManagerDetailsModal manager={manager} onClose={() => setViewing(false)} />}
      <PersonCard person={manager} subtitle={manager.position ?? "Rəhbərlik"} onOpen={() => setViewing(true)} />
    </>
  );
}
