"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Package, Warehouse, Wrench } from "lucide-react";
import { ToolStats, type StockRow } from "@/components/depot/ToolStats";
import { initials } from "@/lib/experience";

// tool_stock sətri: alət və ya material (kind), ölçü vahidi, parçalar (usta işlədib, qalanını təhvil verib)
export type StockItem = StockRow & { kind: string; unit: string; pieces_count: number; pieces_total: number; pack_name: string | null; pack_size: number | null };
export type HeldItem = { id: number; name: string; quantity: number; material: boolean; unit: string; pack_name: string | null; pack_size: number | null };

// Qablı materialda (balon...) tam qabların sayı mötərizədə: "44 kq (4 balon)"
const packSuffix = (n: number, p: { pack_name: string | null; pack_size: number | null }) =>
  p.pack_size && p.pack_name && n > 0 && n % p.pack_size === 0 ? ` (${n / p.pack_size} ${p.pack_name})` : "";
export type HolderPerson = { id: number; name: string; photo: string | null; items: HeldItem[] };

type Kind = "tool" | "material";

function Face({ name, photo }: { name: string; photo: string | null }) {
  return photo
    // eslint-disable-next-line @next/next/no-img-element -- storage avatarı
    ? <img src={photo} alt={name} className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/10" />
    : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">{initials(name)}</span>;
}

// "Kimdə nə var": hər usta bir sətir (şəkil, ad, say); klik → üzərindəki alətlər/materiallar açılır. Öz sətrin birinci və açıq.
function People({ people, myId, material }: { people: HolderPerson[]; myId: number | null; material: boolean }) {
  const list = people
    .map((p) => ({ ...p, items: p.items.filter((i) => i.material === material) }))
    .filter((p) => p.items.length > 0);
  // Klik olunanlar: öz sətrin standart açıqdır, qalanı bağlı; klik həmin vəziyyəti tərsinə çevirir
  const [toggled, setToggled] = useState<Set<number>>(() => new Set());
  const toggle = (id: number) => setToggled((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h3 className="mb-2 mt-5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white/45">
        {material ? "Ustalarda olan materiallar" : "Kimdə nə var"}
        {list.length > 0 && <span className="normal-case tracking-normal">{list.length} usta</span>}
      </h3>
      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 px-3 py-6 text-center text-sm text-white/55">
          {material ? "Materialların hamısı depodadır." : "Alətlərin hamısı depodadır."}
        </p>
      ) : (
        <ul className="-mr-1 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((p) => {
            const isOpen = (p.id === myId) !== toggled.has(p.id);
            const count = material ? p.items.length : p.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <li key={p.id} className={`overflow-hidden rounded-2xl transition-colors ${isOpen ? "bg-white/[0.08]" : "bg-white/[0.04] hover:bg-white/[0.07]"}`}>
                <button type="button" onClick={() => toggle(p.id)} aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
                  <Face name={p.name} photo={p.photo} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <span className="truncate">{p.name}</span>
                      {p.id === myId && <span className="shrink-0 rounded-full bg-frost/20 px-2 py-0.5 text-[10px] font-bold text-frost">Sən</span>}
                    </span>
                    {!isOpen && <span className="block truncate text-xs text-white/45">{p.items.map((i) => i.name).join(", ")}</span>}
                  </span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold tabular-nums text-white" title={material ? "material növü" : "alət sayı"}>{count}</span>
                  <ChevronDown size={16} className={`shrink-0 text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <ul className="mx-3 mb-2.5 divide-y divide-white/[0.07] border-t border-white/10">
                    {p.items.map((t) => (
                      <li key={t.id} className="flex items-center gap-2.5 py-2 text-sm">
                        {t.material ? <Package size={13} className="shrink-0 text-frost" /> : <Wrench size={13} className="shrink-0 text-frost" />}
                        <span className="min-w-0 flex-1 truncate text-white/85" title={t.name}>{t.name}</span>
                        <span className="shrink-0 text-xs font-bold tabular-nums text-white">
                          {t.material ? `${t.quantity} ${t.unit}${packSuffix(t.quantity, t)}` : `${t.quantity} ədəd`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Materiallar: hər biri bir sətir (ümumi = tam + parçalar), altında depoda / ustalarda / parçalar
function Materials({ items }: { items: StockItem[] }) {
  if (items.length === 0) {
    return <p className="rounded-2xl border border-dashed border-white/15 px-3 py-6 text-center text-sm text-white/55">Depoda hələ material yoxdur.</p>;
  }
  return (
    <ul className="max-h-52 space-y-1.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((m) => (
        <li key={m.name} className="rounded-2xl bg-white/[0.04] px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
              <Package size={14} className="shrink-0 text-frost" />
              <span className="truncate" title={m.name}>{m.name}</span>
            </span>
            <span className="shrink-0 text-sm font-extrabold tabular-nums text-white">{m.quantity + m.pieces_total} {m.unit}</span>
          </div>
          <p className="mt-1 text-xs text-white/50">
            depoda <b className={m.available ? "text-[#4ade80]" : "text-[#f87171]"}>{m.available}{packSuffix(m.available, m)}</b>
            {" · "}ustalarda <b className="text-frost">{m.given_out}{packSuffix(m.given_out, m)}</b>
            {m.pieces_count > 0 && <>{" · "}parçalar <b className="text-white/80">{m.pieces_count} ədəd, {m.pieces_total} {m.unit}</b></>}
          </p>
        </li>
      ))}
    </ul>
  );
}

// Usta panelindəki Depo kartı (tünd, Statistika üslubunda): başlıq + Alətlər/Materiallar keçidi, rəqəm zolağı, "Kimdə nə var"
export function ToolsPanel({ stock, people, myId }: { stock: StockItem[]; people: HolderPerson[]; myId: number | null }) {
  const [kind, setKind] = useState<Kind>("tool");
  const tools = useMemo(() => stock.filter((s) => s.kind === "tool"), [stock]);
  const materials = useMemo(() => stock.filter((s) => s.kind === "material"), [stock]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-frost shadow-[0_6px_16px_rgba(31,111,235,0.35)]"><Warehouse size={18} /></span>
          Depo
        </h2>
        <div className="inline-flex gap-0.5 rounded-xl bg-white/[0.07] p-1" role="tablist" aria-label="Depo bölməsi">
          {([["tool", "Alətlər"], ["material", "Materiallar"]] as const).map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${kind === k ? "bg-white text-navy shadow-sm" : "text-white/60 hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {kind === "tool" ? <ToolStats tools={tools} /> : <Materials items={materials} />}
      <People key={kind} people={people} myId={myId} material={kind === "material"} />
    </div>
  );
}
