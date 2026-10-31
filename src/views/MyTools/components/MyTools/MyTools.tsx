"use client";

import { useData } from "@/lib/useData";
import { fetchMine } from "@/services/myTools/fetchMine";
import { useMyToolsState } from "../../hooks/useMyToolsState";
import { deriveMine } from "../../utils/deriveMine";
import { AskModal } from "../AskModal";
import { ConfirmSection } from "../ConfirmSection";
import { HoldingsSection } from "../HoldingsSection";
import { MyStats } from "../MyStats";
import { RequestsSection } from "../RequestsSection";
import { ReturnModal } from "../ReturnModal";
import { WhoHasCard } from "../WhoHasCard";
import type { MyToolsProps } from "@/types/myTools";
import { Card } from "@/shared/components/Card";

// Alətlərim (usta paneli, 0084; 2026-10-23 yeni dizayn): üzərimdəki alət və materiallar. Usta depoya özü heç nə qoya bilmir:
// verilən aləti "Aldım / Almadım" ilə təsdiqləyir, qaytarmaq və ya yeni alət istəmək üçün sorğu yazır;
// depo məsulu və ya admin qəbul edəndə say dəyişir. Hadisələr Realtime ilə gəlir (TasksListener → revalidate()).
// Toplu qaytarma (istifadəçi istəyi): cədvəldə işarələ → "Seçilənləri qaytar": hər biri üçün ayrıca sorğu yazılır.
export function MyTools({ employeeId }: MyToolsProps) {
  const data = useData("my-tools", () => (employeeId ? fetchMine(employeeId) : Promise.resolve(null)), [employeeId]);
  const s = useMyToolsState();

  if (!employeeId) return <Card className="muted py-10 text-center text-sm">Hesabın əməkdaş kartına bağlı deyil.</Card>;
  if (!data) return <div className="h-64 animate-pulse rounded-3xl bg-line/60" />;

  const v = { ...s, ...deriveMine(data, s) };
  const askedIds = new Set(v.pendingReq.filter((r) => r.type === "request" && r.tool_id).map((r) => r.tool_id!));
  return (
    <div className="space-y-5">
      {s.returning && <ReturnModal holds={s.returning} employeeId={employeeId} onClose={() => { s.setReturning(null); s.setSelected(new Set()); }} />}
      {s.asking && <AskModal stock={data.stock} pendingIds={askedIds} initialKind={s.tab} onClose={() => s.setAsking(false)} />}
      <MyStats v={v} />
      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          {v.toConfirm.length > 0 && <ConfirmSection items={v.toConfirm} />}
          <HoldingsSection v={v} />
          <RequestsSection requests={data.requests} />
        </div>
        <aside className="relative min-w-0 max-xl:h-[460px]"><WhoHasCard all={data.all} me={employeeId} /></aside>
      </div>
    </div>
  );
}
