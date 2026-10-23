"use client";

import { useState } from "react";
import { ClipboardCheck, FileSpreadsheet, History, PackagePlus, ShoppingCart } from "lucide-react";
import { Page } from "@/components/Page";
import { PendingBlock } from "@/components/depot/Approvals";
import { DepotBoard, type DepotView } from "@/components/depot/DepotBoard";
import { CountModal, ReceiptModal } from "@/components/depot/DepotDocs";
import { exportStock, MoreMenu, ShoppingModal } from "@/components/depot/DepotExtras";
import { HistoryModal } from "@/components/depot/HistoryModal";
import { isLowStock, type DepotRequest, type Holding, type Kind, type Piece, type Loss, type Repair, type Tool } from "@/components/depot/depotUtils";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";

// Admin panelinin pages/Depot.tsx səhifəsinin kopyası (depo məsulu üçün; "Depo məsulu" pəncərəsi yalnız admində). Əl ilə sinxron saxla.
async function fetchDepot() {
  const supabase = createClient();
  const [{ data: tools }, { data: holdings }, { data: employees }, { data: pieces }, { data: requests }, { data: repairs }, { data: losses }] = await Promise.all([
    supabase.from("tool_stock").select("*").order("name"),
    supabase.from("tool_assignments")
      .select("id, tool_id, employee_id, quantity, taken_at, received_at, disputed_at, employees(full_name, photo_url)")
      .is("returned_at", null)
      .order("taken_at"),
    supabase.from("employees")
      .select("id, full_name, photo_url, position, is_management, is_storekeeper, user_id")
      .eq("is_active", true)
      .order("full_name"),
    supabase.from("material_pieces").select("id, tool_id, length, original_length, created_at, employees(full_name)").order("created_at"),
    supabase.from("depot_requests").select("*").eq("status", "pending").order("created_at"),
    supabase.from("tool_repairs").select("*").is("returned_at", null).order("sent_at"),
    // Təsdiqlənmiş silinmələr (xarab, itib, oğurlanıb; "sərf olunub" yox): siyahıda və alət pəncərəsində səbəb göstərilir
    supabase.from("depot_requests").select("tool_id, quantity, reason, note, decided_at").eq("type", "writeoff").eq("status", "approved").neq("reason", "used").order("decided_at", { ascending: false }),
  ]);
  return {
    tools: (tools ?? []) as Tool[], holdings: (holdings ?? []) as Holding[], pieces: (pieces ?? []) as Piece[], employees: employees ?? [],
    requests: (requests ?? []) as DepotRequest[], repairs: (repairs ?? []) as Repair[], losses: (losses ?? []) as Loss[],
  };
}

export function DepotPage({ myUid, owner }: { myUid: string | null; owner: boolean }) {
  const data = useData(fetchDepot);
  const [tab, setTab] = useState<DepotView>("home");
  const [openToolId, setOpenToolId] = useState<number | null>(null);
  const [modal, setModal] = useState<"receipt" | "count" | "shopping" | "journal" | null>(null);
  const [receiptTool, setReceiptTool] = useState<Tool | null>(null);
  const kind: Kind = tab === "material" ? "material" : "tool";

  function openReceipt(t: Tool | null) {
    setReceiptTool(t);
    setModal("receipt");
  }

  const tools = data?.tools ?? [];
  const holdings = data?.holdings ?? [];
  const low = tools.filter(isLowStock).length;

  return (
    <Page title="Depo"
      actions={
        <span className="flex items-center gap-2">
          {data && (
            <MoreMenu items={[
              { label: "Sayım", icon: ClipboardCheck, onClick: () => setModal("count") },
              { label: "Alınmalı", icon: ShoppingCart, onClick: () => setModal("shopping"), badge: low },
              { label: "Excel", icon: FileSpreadsheet, onClick: () => exportStock(tools, holdings) },
              { label: "Jurnal", icon: History, onClick: () => setModal("journal") },
            ]} />
          )}
          <button type="button" onClick={() => openReceipt(null)} className="btn btn-primary btn-sm !h-10 shrink-0"><PackagePlus size={16} /> Mədaxil</button>
        </span>
      }>
      {!data ? (
        <div className="space-y-4">
          <div className="h-14 animate-pulse rounded-xl bg-line/60" />
          <div className="h-[220px] animate-pulse rounded-2xl bg-line/60" />
        </div>
      ) : (
        <div className="space-y-5">
          {modal === "receipt" && (
            <ReceiptModal tools={tools} initialKind={(receiptTool?.kind as Kind) ?? kind} initialToolId={receiptTool?.id ?? null} onClose={() => setModal(null)} />
          )}
          {modal === "count" && <CountModal tools={tools} kind={kind} onClose={() => setModal(null)} />}
          {modal === "shopping" && <ShoppingModal tools={tools} onReceipt={(t) => openReceipt(t)} onClose={() => setModal(null)} />}
          {modal === "journal" && <HistoryModal kind={kind} onClose={() => setModal(null)} />}

          <PendingBlock requests={data.requests} holdings={holdings} tools={tools} myUid={myUid} owner={owner} />

          <DepotBoard tab={tab} onTab={setTab} tools={tools} holdings={holdings} pieces={data.pieces} employees={data.employees}
            requests={data.requests} repairs={data.repairs} losses={data.losses} canManage
            openToolId={openToolId} onOpenTool={setOpenToolId} onReceipt={openReceipt}
            onShopping={() => setModal("shopping")} onJournal={() => setModal("journal")} />
        </div>
      )}
    </Page>
  );
}
