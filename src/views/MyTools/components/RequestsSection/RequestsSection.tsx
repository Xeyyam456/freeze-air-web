import { X } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { createClient } from "@/lib/supabase/client";
import { rpc } from "@/services/myTools/rpc";
import { REQUEST_TYPES } from "@/views/Depot/constants/requests";
import { dateAz, timeAz } from "@/views/Depot/utils/dates";
import { requestLabel } from "@/views/Depot/utils/requests";
import { STATUS } from "../../constants/status";
import { requestLine } from "../../utils/requestLine";
import { StatusDot } from "../StatusDot";
import type { RequestsSectionProps } from "@/types/myTools";

// "Sorğularım": qaytarma, istək, silinmə (son 60); vəziyyət, kim cavab verib, səbəb; gözləyən istəyi geri götürmək olar
export function RequestsSection({ requests }: RequestsSectionProps) {
  return (
    <section className="rounded-3xl border border-line bg-surface">
      <div className="flex items-center gap-2 px-5 pb-3 pt-5 max-sm:px-4 max-sm:pb-2 max-sm:pt-3">
        <h2 className="flex-1 text-lg font-bold max-sm:text-base">Sorğularım</h2>
        <span className="muted text-[13px]">son {requests.length}</span>
      </div>
      {requests.length === 0 ? (
        <p className="muted border-t border-line py-8 text-center text-sm">Hələ sorğu yoxdur.</p>
      ) : (
        <ul className="nice-scroll max-h-[420px] divide-y divide-line overflow-y-auto border-t border-line">
          {requests.map((r) => {
            const s = STATUS[r.status] ?? STATUS.pending;
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 max-sm:px-4 max-sm:py-2">
                <span className={`w-24 shrink-0 rounded-full px-2.5 py-0.5 text-center text-[11px] font-bold ${REQUEST_TYPES[r.type]?.tone ?? ""}`}>{requestLabel(r)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm"><b className="font-semibold">{r.tool_name}</b> <span className="text-ink/70">· {requestLine(r)}</span></span>
                  <span className="muted block truncate text-xs">
                    {dateAz(r.created_at)} {timeAz(r.created_at)}{r.decided_by_name && ` · ${r.decided_by_name}`}{r.decision_note ? ` · “${r.decision_note}”` : ""}
                  </span>
                </span>
                <StatusDot tone={s.tone} label={s.label} />
                {r.status === "pending" && r.type === "request" && (
                  <ConfirmButton onConfirm={async () => { await rpc(() => createClient().rpc("depot_request_cancel", { p_id: r.id }), "İstək ləğv edildi"); }}
                    success={false} className="icon-btn !h-8 !w-8" title="İstəyi geri götür" question="İstək ləğv olunacaq." confirmLabel="Bəli">
                    <X size={14} />
                  </ConfirmButton>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
