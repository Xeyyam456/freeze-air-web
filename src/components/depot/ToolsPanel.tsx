"use client";

import { useMemo, useState } from "react";
import { Package, Wrench } from "lucide-react";
import { ToolStats, type StockRow } from "@/components/depot/ToolStats";
import { Avatar } from "@/components/employees/EmployeeList";

// tool_stock sətri: alət və ya material (kind), ölçü vahidi, parçalar (usta işlədib, qalanını təhvil verib)
export type StockItem = StockRow & { kind: string; unit: string; pieces_count: number; pieces_total: number; pack_name: string | null; pack_size: number | null };
export type HeldItem = { id: number; name: string; quantity: number; material: boolean; unit: string; pack_name: string | null; pack_size: number | null };

// Qablı materialda (balon...) tam qabların sayı mötərizədə: "44 kq (4 balon)"
const packSuffix = (n: number, p: { pack_name: string | null; pack_size: number | null }) =>
  p.pack_size && p.pack_name && n > 0 && n % p.pack_size === 0 ? ` (${n / p.pack_size} ${p.pack_name})` : "";
export type HolderPerson = { id: number; name: string; photo: string | null; items: HeldItem[] };

type Kind = "tool" | "material";

// Hər ustada nə var: öz kartın birinci ("Sən"), qalanı əlifba ilə (sıralama serverdə)
function People({ people, myId, material }: { people: HolderPerson[]; myId: number | null; material: boolean }) {
  const list = people
    .map((p) => ({ ...p, items: p.items.filter((i) => i.material === material) }))
    .filter((p) => p.items.length > 0);

  return (
    <>
      <h3 className="mb-1 mt-5 text-xs font-bold uppercase tracking-wide text-muted">{material ? "Ustalarda olan materiallar" : "Kimdə nə var"}</h3>
      {list.length === 0 ? (
        <p className="muted rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm">
          {material ? "Materialların hamısı depodadır." : "Alətlərin hamısı depodadır."}
        </p>
      ) : (
        <ul className="nice-scroll -mr-2 min-h-0 flex-1 divide-y divide-line overflow-y-auto pr-2">
          {list.map((p) => (
            <li key={p.id} className="flex items-start gap-3 py-3">
              <Avatar employee={{ full_name: p.name, photo_url: p.photo }} className="!h-9 !w-9 shrink-0 !text-xs" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {p.name}
                  {p.id === myId && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">Sən</span>}
                </p>
                <p className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.items.map((t) => (
                    <span key={t.id} className="inline-flex items-center gap-1 rounded-lg bg-bg px-2 py-1 text-xs font-medium">
                      {t.material ? <Package size={11} className="text-primary" /> : <Wrench size={11} className="text-primary" />} {t.name}
                      {t.material ? <b className="text-primary">{t.quantity} {t.unit}{packSuffix(t.quantity, t)}</b> : t.quantity > 1 && <b className="text-primary">×{t.quantity}</b>}
                    </span>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// Materiallar: hər biri üçün ümumi (tam + parçalar), tam hissənin depoda/ustalarda olanı və parçalar
function Materials({ items }: { items: StockItem[] }) {
  if (items.length === 0) {
    return <p className="muted rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm">Depoda hələ material yoxdur.</p>;
  }
  return (
    <ul className="nice-scroll -mr-2 max-h-52 divide-y divide-line overflow-y-auto pr-2">
      {items.map((m) => (
        <li key={m.name} className="py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
              <Package size={14} className="shrink-0 text-primary" />
              <span className="truncate" title={m.name}>{m.name}</span>
            </span>
            {/* Ümumilikdə nə qədər var = tam hissə + parçalar */}
            <span className="shrink-0 text-sm font-bold tabular-nums">{m.quantity + m.pieces_total} {m.unit}</span>
          </div>
          <p className="muted mt-1 text-xs">
            tam: depoda <b className={m.available ? "text-ok" : "text-danger"}>{m.available}{packSuffix(m.available, m)}</b>, ustalarda <b className="text-primary">{m.given_out}{packSuffix(m.given_out, m)}</b>
            {" · "}parçalar: <b className="text-ink">{m.pieces_count} ədəd{m.pieces_count ? `, ${m.pieces_total} ${m.unit}` : ""}</b>
          </p>
        </li>
      ))}
    </ul>
  );
}

// Usta panelindəki Depo kartı: iki tab (Alətlər / Materiallar), Depo-dakı kimi
export function ToolsPanel({ stock, people, myId }: { stock: StockItem[]; people: HolderPerson[]; myId: number | null }) {
  const [kind, setKind] = useState<Kind>("tool");
  const tools = useMemo(() => stock.filter((s) => s.kind === "tool"), [stock]);
  const materials = useMemo(() => stock.filter((s) => s.kind === "material"), [stock]);

  return (
    <>
      <div className="mb-3 inline-flex w-fit gap-1 rounded-xl bg-line/60 p-1" role="tablist">
        {([["tool", "Alətlər"], ["material", "Materiallar"]] as const).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${kind === k ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>
      {kind === "tool" ? (
        <ToolStats tools={tools} />
      ) : (
        <Materials items={materials} />
      )}
      <People people={people} myId={myId} material={kind === "material"} />
    </>
  );
}
