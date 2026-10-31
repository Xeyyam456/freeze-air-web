import { useState } from "react";
import { Hand, Package, Search, Send, Wrench } from "lucide-react";
import { DHead } from "@/views/Depot/components/DHead";
import { fmt, isPacked, parseQty, round2, withUnit } from "@/views/Depot/utils/quantity";
import { norm } from "@/shared/utils/norm";
import type { Kind, Tool } from "@/types/depot";
import { Modal } from "@/shared/components/Modal";
import { sendToolRequests } from "@/services/myTools/sendToolRequests";
import { toast } from "@/lib/toast";
import { MiniSeg } from "@/views/Depot/components/MiniSeg";
import type { AskModalProps } from "@/types/myTools";
import { Button } from "@/shared/components/Button";

// Alət istə (bir dəfəyə bir neçə; 0086): siyahıdan işarələ, hər birinin miqdarını yaz. Depoda olmayanı da istəmək olar
// (depo məsulu görür ki, verə bilmir). Hamısı eyni batch ilə yazılır: depoda bir qrup kimi görünür.
export function AskModal({ stock, pendingIds, initialKind, onClose }: AskModalProps) {
  const [tab, setTab] = useState<Kind>(initialKind);
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState<Record<number, string>>({}); // seçilənlər: id → miqdar (mətn)
  const [byPack, setByPack] = useState<Record<number, boolean>>({}); // qablı materialda balonla (standart) və ya kq ilə
  const inPack = (t: Tool) => isPacked(t) && byPack[t.id] !== false;
  const amount = (t: Tool) => round2(parseQty(qty[t.id] ?? "") * (inPack(t) ? t.pack_size! : 1));
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const shown = stock.filter((t) => t.kind === tab && norm(t.name).includes(norm(query.trim())));
  const chosen = stock.filter((t) => qty[t.id] !== undefined);
  const okQty = (t: Tool) => { const n = parseQty(qty[t.id] ?? ""); return n > 0 && (t.kind === "material" || Number.isInteger(n)); };
  const unitLabel = (t: Tool) => (t.kind !== "material" ? "ədəd" : inPack(t) ? t.pack_name! : t.unit);
  const valid = chosen.length > 0 && chosen.every(okQty);
  const toggle = (t: Tool) => setQty((q) => { const n = { ...q }; if (n[t.id] === undefined) n[t.id] = "1"; else delete n[t.id]; return n; });

  async function submit() {
    if (!valid) return toast.error("Seçdiklərinin miqdarını düzgün yaz.");
    setPending(true);
    const failed = await sendToolRequests(chosen.map((t) => ({ tool: t, amount: amount(t) })), note);
    setPending(false);
    if (!failed) onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="ask-title" className="flex !max-w-xl flex-col">
      <DHead id="ask-title" icon={Hand} tone="violet" title={tab === "material" ? "Material istə" : "Alət istə"} sub={<><span className="max-sm:hidden">Bir neçəsini işarələ, miqdarını yaz, birdən göndər</span><span className="sm:hidden">İşarələ, miqdarı yaz, göndər</span></>} onClose={onClose} />
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl bg-line/60 p-1 max-sm:w-full" role="tablist" aria-label="Növ">
          {([["tool", "Alətlər", Wrench], ["material", "Materiallar", Package]] as const).map(([k, l, Icon]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold transition-colors max-sm:h-8 max-sm:flex-1 max-sm:justify-center max-sm:gap-1.5 max-sm:px-2 max-sm:text-xs ${tab === k ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
              <Icon size={14} /> {l}
            </button>
          ))}
        </div>
        <label className="relative min-w-[180px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Axtar..." aria-label="Axtar" className="field !h-10 !rounded-xl !pl-9 !text-sm max-sm:!h-8 max-sm:!text-xs" />
        </label>
      </div>
      <ul className="mt-3 max-h-[min(360px,calc(100dvh-400px))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden divide-y divide-line overflow-y-auto rounded-2xl border border-line px-3">
        {shown.map((t) => {
          const on = qty[t.id] !== undefined;
          const asked = pendingIds.has(t.id);
          return (
            <li key={t.id} className={`flex items-center gap-3 py-2.5 max-sm:gap-2 max-sm:py-2 ${asked ? "opacity-50" : ""}`}>
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 max-sm:gap-2">
                <input type="checkbox" checked={on} disabled={asked} onChange={() => toggle(t)} className="h-4 w-4 shrink-0 accent-[var(--color-primary)]" />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm max-sm:text-xs font-semibold">{t.name}</b>
                  <span className={`block text-xs max-sm:text-[10px] ${asked ? "text-muted" : t.available > 0 ? "text-[#15803d]" : "text-[#b45309]"}`}>
                    {asked ? "artıq istəmisən: gözləyir" : t.available > 0 ? `depoda ${withUnit(t.available, t)}` : "depoda yoxdur (yenə istəmək olar)"}
                  </span>
                </span>
              </label>
              {on && (
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="flex items-center gap-1.5">
                    <input value={qty[t.id]} onChange={(e) => setQty((q) => ({ ...q, [t.id]: e.target.value }))} inputMode="decimal" aria-label={`${t.name}: miqdar`}
                      className={`field !h-9 !w-16 !px-2 text-center !text-sm max-sm:!h-7 max-sm:!w-11 max-sm:!px-1 max-sm:!text-xs ${okQty(t) ? "" : "!border-danger"}`} />
                    {isPacked(t)
                      ? <MiniSeg value={inPack(t)} onChange={(v) => setByPack((m) => ({ ...m, [t.id]: v }))} items={[[true, t.pack_name], [false, t.unit]]} label="Vahid" />
                      : <span className="muted w-10 text-xs max-sm:w-8 max-sm:text-[10px]">{unitLabel(t)}</span>}
                  </span>
                  {inPack(t) && okQty(t) && <span className="muted text-[11px]">= {fmt(amount(t))} {t.unit}</span>}
                </span>
              )}
            </li>
          );
        })}
        {shown.length === 0 && <li className="muted py-6 text-center text-sm">Heç nə tapılmadı.</li>}
      </ul>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nə üçün (istəyə görə)" aria-label="Nə üçün" className="field mt-3 max-sm:!h-8 max-sm:!text-xs" />
      <div className="mt-4 flex gap-2 max-sm:mt-3">
        <Button type="button" disabled={pending || !valid} onClick={submit} className="min-w-0 flex-1 max-sm:!h-8 max-sm:!px-2 max-sm:!text-xs">
          <Send size={15} /> {pending ? "Göndərilir..." : chosen.length ? `İstə (${chosen.length})` : "Yuxarıdan seç"}
        </Button>
        <Button type="button" onClick={onClose} variant="cancel" className="max-sm:!h-8 max-sm:!px-3 max-sm:!text-xs">Ləğv et</Button>
      </div>
    </Modal>
  );
}
