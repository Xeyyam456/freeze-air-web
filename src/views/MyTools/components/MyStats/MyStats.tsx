import { Clock, Hand, Hourglass, Package, Wrench } from "lucide-react";
import { DStat } from "@/views/Depot/components/DStat";
import type { MyToolsView } from "@/types/myTools";

// 4 göstərici (Məndə alət, Material, Təsdiqləməliyəm, Gözləyən sorğu) + bənövşəyi "Alət istə"
export function MyStats({ v }: { v: MyToolsView }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 max-sm:gap-2 max-sm:[&>div]:grid max-sm:[&>div]:grid-cols-[auto_minmax(0,1fr)] max-sm:[&>div]:items-center max-sm:[&>div]:gap-x-1.5 max-sm:[&>div]:gap-y-0.5 max-sm:[&>div]:!p-2 max-sm:[&>div>span]:!h-5 max-sm:[&>div>span]:!w-5 max-sm:[&>div>span]:!rounded-md max-sm:[&>div>span>svg]:!h-3 max-sm:[&>div>span>svg]:!w-3 max-sm:[&>div>p]:!mt-0 max-sm:[&>div>p]:leading-tight max-sm:[&>div>p:first-of-type]:truncate max-sm:[&>div>p:first-of-type]:!text-[11px] max-sm:[&>div>p:last-of-type]:col-span-2 max-sm:[&>div>p:last-of-type]:!text-lg">
        <DStat icon={Wrench} tone="blue" label="Məndə alət" value={`${v.tools.reduce((n, h) => n + h.quantity, 0)} ədəd`} />
        <DStat icon={Package} tone="teal" label="Material" value={`${v.materials.length} növ`} />
        <DStat icon={Hourglass} tone="amber" label="Təsdiqləməliyəm" value={v.toConfirm.length} />
        <DStat icon={Clock} tone="violet" label="Gözləyən sorğu" value={v.pendingReq.length} />
      </div>
      <button type="button" onClick={() => v.setAsking(true)}
        className="flex h-12 max-sm:h-10 items-center justify-center gap-2 rounded-2xl xl:h-auto xl:min-h-[88px] bg-[linear-gradient(135deg,#7c3aed,#4f46e5)] px-6 py-4 max-sm:py-2 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(79,70,229,0.7)] transition hover:brightness-110">
        <Hand size={18} /> {v.tab === "material" ? "Material istə" : "Alət istə"}
      </button>
    </div>
  );
}
