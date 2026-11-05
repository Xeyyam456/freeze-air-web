import { Check, CircleAlert, Package, Wrench } from "lucide-react";
import { ConfirmButton } from "@/components/ConfirmButton";
import { confirmAssignment } from "@/services/myTools/actions";
import { rpc } from "@/services/myTools/rpc";
import { Button } from "@/shared/components/Button";
import type { ConfirmSectionProps } from "@/types/myTools";
import { SOFT } from "@/views/Depot/constants/tones";
import { dateAz, timeAz } from "@/views/Depot/utils/dates";
import { showQty } from "@/views/Depot/utils/quantity";

// "Sənə verildi: təsdiqlə": əlinə çatıbsa «Aldım», çatmayıbsa «Almadım» (depo məsulu yoxlayır)
export function ConfirmSection({ items }: ConfirmSectionProps) {
  return (
    <section className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-5 max-sm:p-3">
      <h2 className="flex items-center gap-2 text-[15px] font-bold"><CircleAlert size={17} className="text-amber-300" /> Sənə verildi: təsdiqlə</h2>
      <p className="muted mb-3 text-xs">Əlinə çatıbsa «Aldım» bas. Çatmayıbsa «Almadım»: depo məsulu yoxlayacaq.</p>
      <ul className="divide-y divide-[#fde3b4] rounded-2xl border border-amber-500/40 bg-surface px-3">
        {items.map((h) => {
          const t = h.tools!;
          return (
            <li key={h.id} className="flex flex-wrap items-center gap-3 py-2.5 max-sm:[&>button]:flex-1">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${t.kind === "material" ? SOFT.teal : SOFT.blue}`}>{t.kind === "material" ? <Package size={16} /> : <Wrench size={16} />}</span>
              <span className="min-w-0 flex-[1_1_140px]">
                <b className="line-clamp-2 text-sm font-semibold">{t.name} <span className="font-bold text-primary">{showQty(h.quantity, t.kind === "material" ? t.unit : "ədəd", t)}</span></b>
                <span className="muted block text-xs">{dateAz(h.taken_at)} · {timeAz(h.taken_at)}{h.disputed_at ? " · «Almadım» dedin, depo yoxlayır" : ""}</span>
              </span>
              <Button size="sm" onClick={() => rpc(() => confirmAssignment(h.id, true), "Təsdiqləndi: aldın")}
                className="!h-9 max-sm:!h-8"><Check size={15} /> Aldım</Button>
              {!h.disputed_at && (
                <ConfirmButton onConfirm={async () => { await rpc(() => confirmAssignment(h.id, false), "Depo məsuluna bildirildi"); }}
                  success={false} variant="cancel" size="sm" className="!h-9 max-sm:!h-8" title="Almadım" question="Depo məsulu yoxlayacaq. Sonra yenə «Aldım» basa bilərsən." confirmLabel="Bəli, almamışam">
                  Almadım
                </ConfirmButton>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
