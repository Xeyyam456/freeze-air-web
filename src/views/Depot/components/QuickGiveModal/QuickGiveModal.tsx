"use client";

import { Send } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { DHead } from "@/views/Depot/components/ui";
import { withUnit, type DepotEmployee, type Tool } from "@/views/Depot/utils";
import { GiveForm } from "@/views/Depot/components/GiveForm";

// Siyahıdakı sətirdən sürətli "Ver": alətin pəncərəsini açmadan usta seç, say yaz, ver
export function QuickGiveModal({ tool, employees, onClose }: { tool: Tool; employees: DepotEmployee[]; onClose: () => void }) {
  return (
    <Modal onClose={onClose} labelledBy="quick-give-title" className="!max-w-md">
      <DHead id="quick-give-title" icon={Send} tone="blue" title={`Ver: ${tool.name}`} sub={<>Depoda <b className="text-ok">{withUnit(tool.available, tool)}</b></>} onClose={onClose} />
      <GiveForm tool={tool} employees={employees} onDone={onClose} />
    </Modal>
  );
}
