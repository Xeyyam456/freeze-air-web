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

function Row({ t, k }: { t: StockRow; k: Kinds }) {
  return (
    <li className="flex items-center gap-2.5 py-2.5 text-sm">
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
  // "Bütün alətlər": geniş pəncərə, iki sütun, ortada xətt (əlifba sırası birinci sütunda aşağı gedir, sonra ikinciyə keçir)
  const split = current?.kind === "total";
  const half = Math.ceil(rows.length / 2);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 text-center">
        {KINDS.map((k) => (
          <button key={k.kind} type="button" onClick={() => setOpen(k.kind)}
            className="rounded-xl bg-bg px-2 py-2.5 transition-colors hover:bg-primary-soft" title={`${k.title}: bax`}>
            <p className={`text-xl font-extrabold tabular-nums ${k.tone}`}>{tools.reduce((s, t) => s + k.count(t), 0)}</p>
            <p className="muted text-xs font-medium">{k.label}</p>
          </button>
        ))}
      </div>

      {current && (
        <Modal onClose={() => setOpen(null)} labelledBy="tool-stats-title" className={split ? "!max-w-4xl" : "!max-w-2xl"}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="tool-stats-title" className="text-lg font-bold">{current.title}</h2>
            <button type="button" onClick={() => setOpen(null)} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
          </div>
          {rows.length === 0 ? (
            <p className="muted rounded-xl border border-dashed border-line px-3 py-8 text-center text-sm">
              {current.kind === "left" ? "Depoda alət qalmayıb." : "Burada alət yoxdur."}
            </p>
          ) : (
            // Zolaq gizlidir (istifadəçi qərarı), sürüşmə işləyir; aşağıda yumşaq solğunlaşma siyahının davam etdiyini göstərir
            split ? (
              // Sütunlar eyni sürüşən qutudadır: birlikdə sürüşür, ortadakı xətt bütün hündürlüyü tutur
              <div className="grid grid-cols-2 max-h-[min(420px,calc(100vh-240px))] overflow-y-auto pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <ul className="divide-y divide-line border-r border-line pr-6">
                  {rows.slice(0, half).map((t) => <Row key={t.name} t={t} k={current} />)}
                </ul>
                <ul className="divide-y divide-line pl-6">
                  {rows.slice(half).map((t) => <Row key={t.name} t={t} k={current} />)}
                </ul>
              </div>
            ) : (
              <ul className="divide-y divide-line max-h-[min(420px,calc(100vh-240px))] overflow-y-auto pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-28px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {rows.map((t) => <Row key={t.name} t={t} k={current} />)}
              </ul>
            )
          )}
        </Modal>
      )}
    </>
  );
}
