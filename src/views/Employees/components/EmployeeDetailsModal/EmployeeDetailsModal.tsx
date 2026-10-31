import { useState } from "react";
import { WorkTab } from "@/components/work/WorkTab";
import { Avatar } from "@/shared/components/Avatar";
import { Modal } from "@/shared/components/Modal";
import { ProfileBanner } from "@/shared/components/ProfileBanner";
import type { DetailsTab, EmployeeDetailsModalProps } from "@/types/employees";
import { AboutTab } from "./AboutTab";
import { DetailsTabs } from "./DetailsTabs";

// Usta kartına klikləyəndə açılan məlumat pəncərəsi
export function EmployeeDetailsModal({ employee, isMe, onClose }: EmployeeDetailsModalProps) {
  // Öz kartını açan usta birbaşa işlərinə düşür
  const [tab, setTab] = useState<DetailsTab>(isMe ? "work" : "about");

  return (
    <Modal onClose={onClose} labelledBy={`emp-${employee.id}-title`} className="!max-w-2xl overflow-hidden !p-0">
      <ProfileBanner onClose={onClose} />
      <div className="relative -mt-12 px-6 pb-6 text-center">
        <Avatar employee={employee} className="mx-auto !h-24 !w-24 !text-2xl ring-4 ring-white" />
        <h2 id={`emp-${employee.id}-title`} className="mt-3 text-xl font-bold">{employee.full_name}</h2>
        <p className="muted text-sm">{employee.specialty ?? "İxtisas yazılmayıb"}</p>

        <DetailsTabs tab={tab} onTab={setTab} />

        {/* Bütün tablar eyni hündürlükdədir ki, keçid zamanı pəncərə tullanmasın */}
        <div className="mt-3 h-[min(340px,calc(100vh-330px))] text-left text-sm">
          {tab === "about"
            ? <AboutTab employee={employee} />
            : <WorkTab employeeId={employee.id} employeeName={employee.full_name} />}
        </div>
      </div>
    </Modal>
  );
}
