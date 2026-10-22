"use client";

import { useState } from "react";
import { Wrench, X } from "lucide-react";
import { Modal } from "@/components/Modal";

export type StockRow = { name: string; quantity: number; given_out: number; available: number };

type Kind = "total" | "out" | "left";

const KINDS: { kind: Kind; label: string; title: string; tone: string; count: (t: StockRow) => number }[] = [
  { kind: "total", label: "Cəmi", title: "Bütün alətlər", tone: "", count: (t) => t.quantity },
  { kind: "out", label: "Ustalarda", title: "Ustalarda olan alətlər", tone: "text-primary", count: (t) => t.given_out },
  { kind: "left", label: "Depoda", title: "Depoda qalan alətlər", tone: "text-ok", count: (t) => t.available },
];

type Kinds = (typeof KINDS)[number];

// Tünd zolaqda rəqəmlərin rəngi (modaldakı açıq fon üçün k.tone qalır)
const STRIP_TONE: Record<Kind, string> = { total: "text-white", out: "text-frost", left: "text-[#4ade80]" };

function Row({ t, k }: { t: StockRow; k: Kinds }) {
  return (
    <li className="flex h-10 items-center gap-2.5 text-sm">
      <Wrench size={14} className="shrink-0 text-primary" />
      <span className="min-w-0 flex-1 truncate font-medium" title={t.name}>{t.name}</span>
      {/* Depoda: neçə ədəd qalıb, cəmi neçədən */}
      {k.kind === "left" && t.quantity > t.available && <span className="muted text-xs">cəmi {t.quantity} ədəd</span>}
      <span className={`shrink-0 rounded-full bg-bg px-2.5 py-0.5 text-center text-xs font-bold tabular-nums ${k.tone}`}>{k.count(t)} ədəd</span>
    </li>
  );
}

// Alət xülasəsi: üç xana; klik → həmin hissədəki alətlər və sayı (modal)
export function ToolStats({ tools }: { tools: StockRow[] }) {
  const [open, setOpen] = useState<Kind | null>(null);
  const current = KINDS.find((k) => k.kind === open) ?? null;
  const rows = current ? tools.filter((t) => current.count(t) > 0) : [];

  return (
    <>
      {/* Bir şüşə zolaq, aralarında incə xətt (usta panelinin tünd Depo kartı); klik → həmin hissədəki alətlər */}
      <div className="grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl bg-white/[0.06] text-center ring-1 ring-white/10">
        {KINDS.map((k) => (
          <button key={k.kind} type="button" onClick={() => setOpen(k.kind)}
            className="px-2 py-3 transition-colors hover:bg-white/[0.08]" title={`${k.title}: bax`}>
            <p className={`text-2xl font-extrabold tabular-nums ${STRIP_TONE[k.kind]}`}>{tools.reduce((s, t) => s + k.count(t), 0)}</p>
            <p className="text-[11px] font-medium text-white/50">{k.label}</p>
          </button>
        ))}
      </div>

      {current && (
        <Modal onClose={() => setOpen(null)} labelledBy="tool-stats-title" className="!max-w-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="tool-stats-title" className="text-lg font-bold">{current.title}</h2>
            <button type="button" onClick={() => setOpen(null)} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
          </div>
          {rows.length === 0 ? (
            <p className="muted rounded-xl border border-dashed border-line px-3 py-8 text-center text-sm">
              {current.kind === "left" ? "Depoda alət qalmayıb." : "Burada alət yoxdur."}
            </p>
          ) : (
            // Tək sütun: 10 sətir görünür (10×40px + 9 xətt = 409px + altdakı boşluq 24px), qalanı sürüşür.
            // Zolaq gizlidir (istifadəçi qərarı); aşağıda yumşaq solğunlaşma siyahının davam etdiyini göstərir
            <ul className="max-h-[min(433px,calc(100vh-240px))] divide-y divide-line overflow-y-auto pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {rows.map((t) => <Row key={t.name} t={t} k={current} />)}
            </ul>
          )}
        </Modal>
      )}
    </>
  );
}
