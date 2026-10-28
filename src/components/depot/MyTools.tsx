"use client";

import { useState } from "react";
import { Check, ChevronRight, CircleAlert, Clock, Hand, Hourglass, Package, Search, Send, Undo2, Users, Wrench, X } from "lucide-react";
import { useLoggedUse } from "@/views/Depot/hooks/useLoggedUse";
import { DHead, DStat, SOFT, type Tone } from "@/views/Depot/components/ui";
import { dateAz, daysSince, fmt, isPacked, norm, parseQty, pieceWord, REQUEST_TYPES, requestLabel, round2, showQty, timeAz, withUnit, type DepotRequest, type Kind, type Tool } from "@/views/Depot/utils";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Avatar } from "@/components/employees/EmployeeList";
import { Modal } from "@/shared/components/Modal";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { useData } from "@/lib/useData";

// Alətlərim (usta paneli, 0084; 2026-10-23 yeni dizayn): üzərimdəki alət və materiallar. Usta depoya özü heç nə qoya bilmir:
// verilən aləti "Aldım / Almadım" ilə təsdiqləyir, qaytarmaq və ya yeni alət istəmək üçün sorğu yazır;
// depo məsulu və ya admin qəbul edəndə say dəyişir. Hadisələr Realtime ilə gəlir (TasksListener → revalidate()).
// Toplu qaytarma (istifadəçi istəyi): cədvəldə işarələ → "Seçilənləri qaytar": hər biri üçün ayrıca sorğu yazılır.

type Mine = {
  id: number; tool_id: number; quantity: number; taken_at: string; received_at: string | null; disputed_at: string | null;
  tools: Pick<Tool, "name" | "kind" | "unit" | "pack_name" | "pack_size"> | null;
};

async function fetchMine(employeeId: number) {
  const supabase = createClient();
  const [{ data: holds }, { data: requests }, { data: stock }, { data: all }] = await Promise.all([
    supabase.from("tool_assignments").select("id, tool_id, quantity, taken_at, received_at, disputed_at, tools(name, kind, unit, pack_name, pack_size)")
      .eq("employee_id", employeeId).is("returned_at", null).order("taken_at"),
    supabase.from("depot_requests").select("*").eq("employee_id", employeeId).in("type", ["return", "request", "writeoff"])
      .order("created_at", { ascending: false }).limit(60),
    supabase.from("tool_stock").select("*").order("name"),
    // Kimdə nə var: bütün ustaların üzərindəkilər (yalnız baxış)
    supabase.from("tool_assignments").select("id, tool_id, employee_id, quantity, taken_at, employees(full_name, photo_url), tools(name, kind, unit, pack_name, pack_size)")
      .is("returned_at", null).order("taken_at"),
  ]);
  return { holds: (holds ?? []) as Mine[], requests: (requests ?? []) as DepotRequest[], stock: (stock ?? []) as Tool[], all: (all ?? []) as Held[] };
}

const STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Gözləyir", tone: "amber" },
  approved: { label: "Qəbul edildi", tone: "green" },
  rejected: { label: "Rədd edildi", tone: "red" },
  cancelled: { label: "Ləğv olundu", tone: "slate" },
};

function requestLine(r: DepotRequest) {
  const u = r.tool_kind === "material" ? r.unit : "ədəd";
  if (r.type === "return") return r.tool_kind === "material" ? `işlətdim ${fmt(r.used ?? 0)}, qaytarıram ${fmt(r.returned ?? 0)} ${u}` : `${fmt(r.quantity ?? 0)} ${u}`;
  if (r.type === "request") return `${fmt(r.quantity ?? 0)} ${u}`;
  return `${fmt(r.quantity ?? 0)} ${u}`;
}

async function rpc(fn: () => PromiseLike<{ error: { message: string } | null }>, ok: string) {
  const { error } = await fn();
  if (error) {
    toast.error(error.message);
    return false;
  }
  toast.success(ok);
  revalidate();
  return true;
}

function StatusDot({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${SOFT[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {label}
    </span>
  );
}

// Qaytarılan bir şeyin yazılışı: alətdə say; materialda "qaytarıram X (kq | balon)" + "qalanı: işlətdim | məndə qalır"
type Draft = { qty: string; ret: string; byPack: boolean; restUsed: boolean };
const emptyDraft = (h: Mine): Draft => ({ qty: String(h.quantity), ret: "", byPack: false, restUsed: true });

function calc(h: Mine, d: Draft) {
  const t = h.tools!;
  if (t.kind !== "material") {
    const q = parseQty(d.qty);
    const ok = Number.isInteger(q) && q >= 1 && q <= h.quantity;
    return { ok, over: q > h.quantity, quantity: q, used: 0, returned: 0, hint: ok ? `${q} ədəd qaytarılır` : `1 ilə ${h.quantity} arası yaz` };
  }
  const typed = parseQty(d.ret);
  const ret = round2((Number.isNaN(typed) ? 0 : typed) * (isPacked(t) && d.byPack ? t.pack_size : 1));
  const rest = round2(h.quantity - ret);
  const used = d.restUsed ? Math.max(0, rest) : 0;
  const over = rest < 0;
  const openPart = isPacked(t) ? round2(ret - Math.floor(round2(ret / t.pack_size)) * t.pack_size) : 0;
  const hint = over ? "Səndə olandan çox ola bilməz" : [
    used > 0 && `işlətdim ${fmt(used)} ${t.unit}`,
    ret > 0 && `qaytarıram ${fmt(ret)} ${t.unit}${openPart > 0 ? ` (${fmt(openPart)} ${t.unit} ${pieceWord(t)})` : ""}`,
    !d.restUsed && rest > 0 && `məndə qalır ${fmt(rest)} ${t.unit}`,
  ].filter(Boolean).join(" · ") || "nə qədər qaytardığını yaz";
  return { ok: !over && (ret > 0 || used > 0), over, quantity: 0, used, returned: ret, hint };
}

function Seg({ value, onChange, items }: { value: boolean; onChange: (v: boolean) => void; items: [boolean, string][] }) {
  return (
    <span className="inline-flex shrink-0 gap-0.5 rounded-lg bg-line/60 p-0.5">
      {items.map(([v, l]) => (
        <button key={String(v)} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
          className={`h-7 rounded-md px-2.5 text-xs font-semibold transition-colors ${value === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
          {l}
        </button>
      ))}
    </span>
  );
}

// Toplu qaytarma pəncərəsinin bir sətri
function ReturnLine({ h, d, onChange, employeeId }: { h: Mine; d: Draft; onChange: (d: Draft) => void; employeeId: number }) {
  const t = h.tools!;
  const material = t.kind === "material";
  const c = calc(h, d);
  const logged = useLoggedUse(employeeId, h.tool_id, h.taken_at, material);
  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${material ? SOFT.teal : SOFT.blue}`}>{material ? <Package size={16} /> : <Wrench size={16} />}</span>
        <span className="min-w-0 flex-1">
          <b className="block truncate text-sm font-semibold">{t.name}</b>
          <span className="muted block text-xs">səndə {showQty(h.quantity, material ? t.unit : "ədəd", t)}{logged ? ` · iş qeydlərində ${fmt(logged)} ${t.unit}` : ""}</span>
        </span>
        {!material && (
          <span className="flex items-center gap-1.5">
            <input value={d.qty} onChange={(e) => onChange({ ...d, qty: e.target.value })} inputMode="numeric" aria-label={`${t.name}: say`}
              className={`field !h-9 !w-16 !px-2 text-center !text-sm ${c.over ? "!border-danger" : ""}`} />
            <span className="muted text-xs">ədəd</span>
          </span>
        )}
      </div>
      {material && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-bg p-2.5 max-sm:p-2 sm:ml-12">
          {/* İki qrup, hər biri bölünmür: dar ekranda alt-alta düşür */}
          <span className="flex flex-wrap items-center gap-2">
            <span className="w-16 text-xs font-semibold">Qaytarıram</span>
            <input value={d.ret} onChange={(e) => onChange({ ...d, ret: e.target.value })} inputMode="decimal" placeholder="0" aria-label={`${t.name}: qaytarıram`}
              className={`field !h-8 !w-16 !px-2 !text-[13px] ${c.over ? "!border-danger" : ""}`} />
            {isPacked(t) ? <Seg value={d.byPack} onChange={(v) => onChange({ ...d, byPack: v })} items={[[false, t.unit], [true, t.pack_name]]} />
              : <span className="muted text-xs">{t.unit}</span>}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-16 text-xs font-semibold">Qalanı</span>
            <Seg value={d.restUsed} onChange={(v) => onChange({ ...d, restUsed: v })} items={[[true, "işlətdim"], [false, "məndə qalır"]]} />
          </span>
        </div>
      )}
      <p className={`mt-1.5 text-xs sm:ml-12 ${c.over ? "font-semibold text-danger" : "muted"}`}>{c.hint}</p>
    </li>
  );
}

// Qaytarma (bir və ya bir neçə): hər biri ayrıca sorğu olur, depo məsulu qəbul edəndə səndən çıxır
function ReturnModal({ holds, employeeId, onClose }: { holds: Mine[]; employeeId: number; onClose: () => void }) {
  const [drafts, setDrafts] = useState<Record<number, Draft>>(() => Object.fromEntries(holds.map((h) => [h.id, emptyDraft(h)])));
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const checks = holds.map((h) => ({ h, c: calc(h, drafts[h.id]) }));
  const ready = checks.every((x) => x.c.ok);

  async function submit() {
    if (!ready) return toast.error("Hər sətirdə nə qədər qaytardığını düzgün yaz.");
    setPending(true);
    let failed = 0;
    for (const { h, c } of checks) {
      const material = h.tools!.kind === "material";
      const { error } = await createClient().rpc("depot_return_create", {
        p_assignment_id: h.id, p_quantity: material ? undefined : c.quantity, p_used: material ? c.used : undefined,
        p_returned: material ? c.returned : undefined, p_note: note.trim() || undefined,
      });
      if (error) { failed++; toast.error(`${h.tools!.name}: ${error.message}`); }
    }
    setPending(false);
    revalidate();
    if (failed < holds.length) toast.success(`${holds.length - failed} qaytarma sorğusu göndərildi: depo qəbul edəndə səndən çıxacaq`);
    if (!failed) onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="return-title" className="!max-w-xl">
      <DHead id="return-title" icon={Undo2} tone="blue" onClose={onClose}
        title={holds.length === 1 ? `Qaytar: ${holds[0].tools!.name}` : `${holds.length} şeyi qaytar`}
        sub="Depo məsulu əlində görüb qəbul edəndə səndən çıxır" />
      <ul className="nice-scroll max-h-[min(440px,calc(100dvh-300px))] divide-y divide-line overflow-y-auto rounded-2xl border border-line px-3">
        {holds.map((h) => (
          <ReturnLine key={h.id} h={h} d={drafts[h.id]} employeeId={employeeId} onChange={(d) => setDrafts((all) => ({ ...all, [h.id]: d }))} />
        ))}
      </ul>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Qeyd (istəyə görə)" aria-label="Qeyd" className="field mt-3" />
      <div className="mt-4 flex gap-2">
        <button type="button" disabled={pending || !ready} onClick={submit} className="btn btn-primary flex-1">
          <Send size={15} /> {pending ? "Göndərilir..." : holds.length === 1 ? "Sorğu göndər" : `${holds.length} sorğu göndər`}
        </button>
        <button type="button" onClick={onClose} className="btn btn-cancel">Ləğv et</button>
      </div>
    </Modal>
  );
}

// Alət istə (bir dəfəyə bir neçə; 0086): siyahıdan işarələ, hər birinin miqdarını yaz. Depoda olmayanı da istəmək olar
// (depo məsulu görür ki, verə bilmir). Hamısı eyni batch ilə yazılır: depoda bir qrup kimi görünür.
function AskModal({ stock, pendingIds, initialKind, onClose }: { stock: Tool[]; pendingIds: Set<number>; initialKind: Kind; onClose: () => void }) {
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
    const batch = crypto.randomUUID();
    let failed = 0;
    for (const t of chosen) {
      const { error } = await createClient().rpc("depot_request_create", { p_tool_id: t.id, p_quantity: amount(t), p_note: note.trim() || undefined, p_batch: batch });
      if (error) { failed++; toast.error(`${t.name}: ${error.message}`); }
    }
    setPending(false);
    revalidate();
    if (failed < chosen.length) toast.success(`${chosen.length - failed} istək göndərildi: depo məsulu təsdiqləyəndə sənə veriləcək`);
    if (!failed) onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="ask-title" className="flex !max-w-xl flex-col">
      <DHead id="ask-title" icon={Hand} tone="violet" title={tab === "material" ? "Material istə" : "Alət istə"} sub={<><span className="max-sm:hidden">Bir neçəsini işarələ, miqdarını yaz, birdən göndər</span><span className="sm:hidden">İşarələ, miqdarı yaz, göndər</span></>} onClose={onClose} />
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl bg-line/60 p-1" role="tablist" aria-label="Növ">
          {([["tool", "Alətlər", Wrench], ["material", "Materiallar", Package]] as const).map(([k, l, Icon]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold transition-colors ${tab === k ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
              <Icon size={14} /> {l}
            </button>
          ))}
        </div>
        <label className="relative min-w-[180px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Axtar..." aria-label="Axtar" className="field !h-10 !rounded-xl !pl-9 !text-sm" />
        </label>
      </div>
      <ul className="mt-3 max-h-[min(360px,calc(100dvh-400px))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden divide-y divide-line overflow-y-auto rounded-2xl border border-line px-3">
        {shown.map((t) => {
          const on = qty[t.id] !== undefined;
          const asked = pendingIds.has(t.id);
          return (
            <li key={t.id} className={`flex items-center gap-3 py-2.5 ${asked ? "opacity-50" : ""}`}>
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <input type="checkbox" checked={on} disabled={asked} onChange={() => toggle(t)} className="h-4 w-4 shrink-0 accent-[var(--color-primary)]" />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm font-semibold">{t.name}</b>
                  <span className={`block text-xs ${asked ? "text-muted" : t.available > 0 ? "text-[#15803d]" : "text-[#b45309]"}`}>
                    {asked ? "artıq istəmisən: gözləyir" : t.available > 0 ? `depoda ${withUnit(t.available, t)}` : "depoda yoxdur (yenə istəmək olar)"}
                  </span>
                </span>
              </label>
              {on && (
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="flex items-center gap-1.5">
                    <input value={qty[t.id]} onChange={(e) => setQty((q) => ({ ...q, [t.id]: e.target.value }))} inputMode="decimal" aria-label={`${t.name}: miqdar`}
                      className={`field !h-9 !w-16 !px-2 text-center !text-sm ${okQty(t) ? "" : "!border-danger"}`} />
                    {isPacked(t)
                      ? <Seg value={inPack(t)} onChange={(v) => setByPack((m) => ({ ...m, [t.id]: v }))} items={[[true, t.pack_name], [false, t.unit]]} />
                      : <span className="muted w-10 text-xs">{unitLabel(t)}</span>}
                  </span>
                  {inPack(t) && okQty(t) && <span className="muted text-[11px]">= {fmt(amount(t))} {t.unit}</span>}
                </span>
              )}
            </li>
          );
        })}
        {shown.length === 0 && <li className="muted py-6 text-center text-sm">Heç nə tapılmadı.</li>}
      </ul>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nə üçün (istəyə görə)" aria-label="Nə üçün" className="field mt-3" />
      <div className="mt-4 flex gap-2">
        <button type="button" disabled={pending || !valid} onClick={submit} className="btn btn-primary flex-1">
          <Send size={15} /> {pending ? "Göndərilir..." : chosen.length ? `İstə (${chosen.length})` : "Yuxarıdan seç"}
        </button>
        <button type="button" onClick={onClose} className="btn btn-cancel">Ləğv et</button>
      </div>
    </Modal>
  );
}

// "Kimdə nə var" (2026-10-24, paneldən köçdü): bütün ustaların üzərindəkilər. Kartda usta siyahısı, basanda pəncərə (yalnız baxış).
type Held = {
  id: number; tool_id: number; employee_id: number; quantity: number; taken_at: string;
  employees: { full_name: string; photo_url: string | null } | null;
  tools: Pick<Tool, "name" | "kind" | "unit" | "pack_name" | "pack_size"> | null;
};
type Person = { id: number; name: string; photo: string | null; items: Held[] };

function groupPeople(all: Held[], me: number) {
  const by = new Map<number, Person>();
  for (const h of all) {
    const p = by.get(h.employee_id) ?? { id: h.employee_id, name: h.employees?.full_name ?? "—", photo: h.employees?.photo_url ?? null, items: [] };
    p.items.push(h);
    by.set(h.employee_id, p);
  }
  return [...by.values()].sort((a, b) => (a.id === me ? -1 : b.id === me ? 1 : a.name.localeCompare(b.name, "az")));
}
const counts = (p: Person) => ({
  tools: p.items.filter((h) => h.tools?.kind !== "material").reduce((n, h) => n + h.quantity, 0),
  mats: p.items.filter((h) => h.tools?.kind === "material").length,
});

function PersonView({ p, me, onClose }: { p: Person; me: number; onClose: () => void }) {
  const [kind, setKind] = useState<Kind>(counts(p).tools || !counts(p).mats ? "tool" : "material");
  const c = counts(p);
  const list = p.items.filter((h) => (h.tools?.kind === "material" ? "material" : "tool") === kind);
  return (
    <Modal onClose={onClose} labelledBy="who-title" className="!max-w-xl">
      <div className="-mx-6 -mt-6 max-sm:-mx-4 max-sm:-mt-5 mb-5 overflow-hidden rounded-t-[18px] bg-[linear-gradient(135deg,#7c3aed,#4f46e5_60%,#2563eb)] px-6 max-sm:px-4 pb-5 pt-5 text-white">
        <div className="flex items-start gap-4">
          <Avatar employee={{ full_name: p.name, photo_url: p.photo }} className="!h-14 !w-14 !text-base ring-4 ring-white/25" />
          <div className="min-w-0 flex-1 pt-1">
            <h2 id="who-title" className="truncate text-xl font-bold leading-tight">{p.name}{p.id === me ? " (sən)" : ""}</h2>
            <p className="text-[13px] text-white/70">Üzərindəkilər</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="Bağla"><X size={18} /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {([["Alət", `${c.tools} ədəd`], ["Material", `${c.mats} növ`]] as const).map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-white/12 px-3.5 py-2.5">
              <p className="text-[11px] font-semibold text-white/65">{l}</p>
              <p className="text-lg font-extrabold tabular-nums">{v}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-1 rounded-xl bg-line/60 p-1" role="tablist" aria-label="Növ">
        {([["tool", "Alətlər", c.tools, Wrench], ["material", "Materiallar", c.mats, Package]] as const).map(([k, l, n, Icon]) => (
          <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)}
            className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-[13px] font-semibold transition-colors ${kind === k ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            <Icon size={14} /> {l} <span className="rounded-full bg-bg px-1.5 text-[11px] font-bold text-muted">{n}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="muted mt-4 rounded-2xl border border-dashed border-line py-8 text-center text-sm">{kind === "tool" ? "Alət yoxdur" : "Material yoxdur"}</p>
      ) : (
        <ul className="mt-4 max-h-[min(360px,calc(100dvh-400px))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden divide-y divide-line overflow-y-auto rounded-2xl border border-line px-3">
          {list.map((h) => {
            const t = h.tools;
            const mat = t?.kind === "material";
            const d = daysSince(h.taken_at);
            return (
              <li key={h.id} className="flex items-center gap-3 py-2.5">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${mat ? SOFT.teal : SOFT.blue}`}>{mat ? <Package size={16} /> : <Wrench size={16} />}</span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm font-semibold">{t?.name ?? "—"}</b>
                  <span className="muted block text-xs">götürüb {dateAz(h.taken_at)} · {d === 0 ? "bu gün" : `${d} gün`}</span>
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-primary">{t ? showQty(h.quantity, mat ? t.unit : "ədəd", t) : fmt(h.quantity)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

function WhoHasCard({ all, me }: { all: Held[]; me: number }) {
  const [open, setOpen] = useState<Person | null>(null);
  const [q, setQ] = useState("");
  const people = groupPeople(all, me).filter((p) => norm(p.name).includes(norm(q.trim())) || p.items.some((h) => norm(h.tools?.name).includes(norm(q.trim()))));
  return (
    <section className="absolute inset-0 flex flex-col rounded-3xl border border-line bg-surface p-5">
      {open && <PersonView p={open} me={me} onClose={() => setOpen(null)} />}
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#a78bfa,#7c3aed)] text-white shadow-[0_8px_18px_-6px_rgba(124,58,237,0.55)]"><Users size={18} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold leading-tight">Kimdə nə var</h2>
          <p className="muted text-xs">{people.length} ustanın üzərində əşya var</p>
        </div>
      </div>
      <label className="relative mb-3 block">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Usta və ya alət axtar..." aria-label="Axtar" className="field !h-9 !rounded-xl !pl-9 !text-[13px]" />
      </label>
      {people.length === 0 ? (
        <p className="muted grid flex-1 place-items-center rounded-2xl border border-dashed border-line text-center text-sm">{q ? "Heç nə tapılmadı" : "Heç kimdə heç nə yoxdur"}</p>
      ) : (
        <ul className="-mx-1 min-h-0 flex-1 space-y-1 overflow-y-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {people.map((p) => {
            const c = counts(p);
            return (
              <li key={p.id}>
                <button type="button" onClick={() => setOpen(p)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors hover:bg-[#f6f3ff] ${p.id === me ? "bg-primary-soft/40" : ""}`}>
                  <Avatar employee={{ full_name: p.name, photo_url: p.photo }} className="!h-9 !w-9 !text-[11px]" />
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-[13.5px] font-semibold group-hover:text-[#6d28d9]">{p.name}{p.id === me && <span className="ml-1.5 rounded-full bg-primary px-1.5 py-px text-[10px] font-bold text-white">Sən</span>}</b>
                    <span className="muted block truncate text-xs">{c.tools ? `${c.tools} alət` : ""}{c.tools && c.mats ? " · " : ""}{c.mats ? `${c.mats} material` : ""}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-[#6d28d9]" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function MyTools({ employeeId }: { employeeId: number | null }) {
  const data = useData("my-tools", () => (employeeId ? fetchMine(employeeId) : Promise.resolve(null)), [employeeId]);
  const [returning, setReturning] = useState<Mine[] | null>(null);
  const [asking, setAsking] = useState(false);
  const [tab, setTab] = useState<Kind>("tool");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  if (!employeeId) return <div className="card muted py-10 text-center text-sm">Hesabın əməkdaş kartına bağlı deyil.</div>;
  if (!data) return <div className="h-64 animate-pulse rounded-3xl bg-line/60" />;

  const toConfirm = data.holds.filter((h) => !h.received_at);
  const pendingReturn = new Map(data.requests.filter((r) => r.type === "return" && r.status === "pending").map((r) => [r.assignment_id, r]));
  const pendingReq = data.requests.filter((r) => r.status === "pending");
  const tools = data.holds.filter((h) => h.tools?.kind !== "material");
  const materials = data.holds.filter((h) => h.tools?.kind === "material");
  const list = (tab === "tool" ? tools : materials).filter((h) => norm(h.tools?.name).includes(norm(query.trim())));
  // Qaytarmaq olar: «Aldım» deyilib və qaytarma sorğusu gözləmir
  const returnable = (h: Mine) => !!h.received_at && !pendingReturn.has(h.id);
  const selectable = list.filter(returnable);
  const chosen = data.holds.filter((h) => selected.has(h.id) && returnable(h));
  const allOn = selectable.length > 0 && selectable.every((h) => selected.has(h.id));
  const toggle = (id: number) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="space-y-5">
      {returning && <ReturnModal holds={returning} employeeId={employeeId} onClose={() => { setReturning(null); setSelected(new Set()); }} />}
      {asking && <AskModal stock={data.stock} pendingIds={new Set(pendingReq.filter((r) => r.type === "request" && r.tool_id).map((r) => r.tool_id!))} initialKind={tab} onClose={() => setAsking(false)} />}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 max-sm:gap-2 max-sm:[&>div]:grid max-sm:[&>div]:grid-cols-[auto_minmax(0,1fr)] max-sm:[&>div]:items-center max-sm:[&>div]:gap-x-1.5 max-sm:[&>div]:gap-y-0.5 max-sm:[&>div]:!p-2 max-sm:[&>div>span]:!h-5 max-sm:[&>div>span]:!w-5 max-sm:[&>div>span]:!rounded-md max-sm:[&>div>span>svg]:!h-3 max-sm:[&>div>span>svg]:!w-3 max-sm:[&>div>p]:!mt-0 max-sm:[&>div>p]:leading-tight max-sm:[&>div>p:first-of-type]:truncate max-sm:[&>div>p:first-of-type]:!text-[11px] max-sm:[&>div>p:last-of-type]:col-span-2 max-sm:[&>div>p:last-of-type]:!text-lg">
          <DStat icon={Wrench} tone="blue" label="Məndə alət" value={`${tools.reduce((n, h) => n + h.quantity, 0)} ədəd`} />
          <DStat icon={Package} tone="teal" label="Material" value={`${materials.length} növ`} />
          <DStat icon={Hourglass} tone="amber" label="Təsdiqləməliyəm" value={toConfirm.length} />
          <DStat icon={Clock} tone="violet" label="Gözləyən sorğu" value={pendingReq.length} />
        </div>
        <button type="button" onClick={() => setAsking(true)}
          className="flex h-12 max-sm:h-10 items-center justify-center gap-2 rounded-2xl xl:h-auto xl:min-h-[88px] bg-[linear-gradient(135deg,#7c3aed,#4f46e5)] px-6 py-4 max-sm:py-2 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(79,70,229,0.7)] transition hover:brightness-110">
          <Hand size={18} /> {tab === "material" ? "Material istə" : "Alət istə"}
        </button>
      </div>

      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
      {toConfirm.length > 0 && (
        <section className="rounded-3xl border border-[#fde3b4] bg-[#fffaf0] p-5 max-sm:p-3">
          <h2 className="flex items-center gap-2 text-[15px] font-bold"><CircleAlert size={17} className="text-[#b45309]" /> Sənə verildi: təsdiqlə</h2>
          <p className="muted mb-3 text-xs">Əlinə çatıbsa «Aldım» bas. Çatmayıbsa «Almadım»: depo məsulu yoxlayacaq.</p>
          <ul className="divide-y divide-[#fde3b4] rounded-2xl border border-[#fde3b4] bg-surface px-3">
            {toConfirm.map((h) => {
              const t = h.tools!;
              return (
                <li key={h.id} className="flex flex-wrap items-center gap-3 py-2.5 max-sm:[&>button]:flex-1">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${t.kind === "material" ? SOFT.teal : SOFT.blue}`}>{t.kind === "material" ? <Package size={16} /> : <Wrench size={16} />}</span>
                  <span className="min-w-0 flex-[1_1_140px]">
                    <b className="line-clamp-2 text-sm font-semibold">{t.name} <span className="font-bold text-primary">{showQty(h.quantity, t.kind === "material" ? t.unit : "ədəd", t)}</span></b>
                    <span className="muted block text-xs">{dateAz(h.taken_at)} · {timeAz(h.taken_at)}{h.disputed_at ? " · «Almadım» dedin, depo yoxlayır" : ""}</span>
                  </span>
                  <button type="button" onClick={() => rpc(() => createClient().rpc("assignment_confirm", { p_id: h.id, p_received: true }), "Təsdiqləndi: aldın")}
                    className="btn btn-primary btn-sm !h-9 max-sm:!h-8"><Check size={15} /> Aldım</button>
                  {!h.disputed_at && (
                    <ConfirmButton onConfirm={async () => { await rpc(() => createClient().rpc("assignment_confirm", { p_id: h.id, p_received: false }), "Depo məsuluna bildirildi"); }}
                      success={false} className="btn btn-cancel btn-sm !h-9 max-sm:!h-8" title="Almadım" question="Depo məsulu yoxlayacaq. Sonra yenə «Aldım» basa bilərsən." confirmLabel="Bəli, almamışam">
                      Almadım
                    </ConfirmButton>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="rounded-3xl border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-3 p-4 max-sm:gap-2 max-sm:p-3 sm:p-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-tight max-sm:text-base">Məndə olanlar</h2>
            <p className="muted text-[13px] max-sm:hidden">İşarələ və birdən qaytar, ya da sətirdə «Qaytar»</p>
          </div>
          {chosen.length > 0 && (
            <button type="button" onClick={() => setReturning(chosen)} className="btn btn-primary !h-10 max-sm:!h-9 max-sm:w-full"><Undo2 size={16} /> Seçilənləri qaytar ({chosen.length})</button>
          )}
          <label className="relative w-full sm:w-64">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Axtar..." aria-label="Axtar" className="field !h-10 !rounded-xl !pl-10 !text-sm max-sm:!h-9" />
          </label>
        </div>
        <div className="flex gap-1 border-t border-line px-3 sm:px-4" role="tablist" aria-label="Növ">
          {([["tool", "Alətlər", tools.length, Wrench], ["material", "Materiallar", materials.length, Package]] as const).map(([k, l, n, Icon]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`-mb-px inline-flex h-12 max-sm:h-10 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors ${tab === k ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
              <Icon size={16} /> {l}
              <span className={`rounded-full px-1.5 text-[11px] font-bold ${tab === k ? "bg-primary-soft text-primary" : "bg-bg text-muted"}`}>{n}</span>
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <p className="muted border-t border-line py-10 text-center text-sm">{query ? "Heç nə tapılmadı." : tab === "tool" ? "Üzərində alət yoxdur." : "Üzərində material yoxdur."}</p>
        ) : (
          // Sətirlər (cədvəl deyil): dar yerdə (mobil, "Kimdə nə var"ın yanında) vəziyyət və düymə ikinci sətrə keçir, yana daşmır
          <div className="border-t border-line">
            <label className="flex items-center gap-3 border-b border-line bg-[#f8fafc] px-4 py-2.5 max-sm:py-1.5 text-xs font-semibold text-muted sm:px-5">
              <input type="checkbox" checked={allOn} disabled={!selectable.length} aria-label="Hamısını seç"
                onChange={() => setSelected((s) => { const n = new Set(s); for (const h of selectable) { if (allOn) n.delete(h.id); else n.add(h.id); } return n; })}
                className="h-4 w-4 accent-[var(--color-primary)]" />
              Hamısını seç {selectable.length < list.length && <span className="font-normal">(təsdiqlənməyən və qaytarılan seçilmir)</span>}
            </label>
            <ul className="divide-y divide-line">
              {list.map((h) => {
                const t = h.tools!;
                const material = t.kind === "material";
                const ret = pendingReturn.get(h.id);
                const d = daysSince(h.taken_at);
                const st: { tone: Tone; label: string } = !h.received_at ? (h.disputed_at ? { tone: "red", label: "«Almadım» dedin" } : { tone: "amber", label: "Təsdiqlə ↑" })
                  : ret ? { tone: "violet", label: "Qaytarma gözləyir" } : { tone: "green", label: "Məndədir" };
                return (
                  <li key={h.id} className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 max-sm:py-2 transition-colors sm:px-5 ${selected.has(h.id) ? "bg-primary-soft/40" : "hover:bg-[#f7f9fd]"}`}>
                    <input type="checkbox" checked={selected.has(h.id)} disabled={!returnable(h)} onChange={() => toggle(h.id)} aria-label={`${t.name}: seç`}
                      className="h-4 w-4 shrink-0 accent-[var(--color-primary)] disabled:opacity-30" />
                    <span className={`grid h-9 w-9 max-sm:h-8 max-sm:w-8 shrink-0 place-items-center rounded-lg ${material ? SOFT.teal : SOFT.blue}`}>{material ? <Package size={16} /> : <Wrench size={16} />}</span>
                    <span className="min-w-0 flex-[1_1_160px]">
                      <b className="line-clamp-2 text-sm font-semibold">{t.name}</b>
                      <span className="muted block text-xs">götürmüşəm {dateAz(h.taken_at)} · {d === 0 ? "bu gün" : `${d} gün`}</span>
                    </span>
                    <span className="shrink-0 text-right tabular-nums"><b className="text-[15px]">{fmt(h.quantity)}</b> <span className="text-xs text-muted">{material ? t.unit : "ədəd"}</span></span>
                    {/* İkinci hissə: dar yerdə alt sətirdə, sağa yığılır */}
                    <span className="ml-auto flex shrink-0 items-center gap-2">
                      <StatusDot tone={st.tone} label={st.label} />
                      {ret ? (
                        <ConfirmButton onConfirm={async () => { await rpc(() => createClient().rpc("depot_request_cancel", { p_id: ret.id }), "Sorğu ləğv edildi"); }} success={false}
                          className="btn btn-cancel btn-sm !h-8" title="Sorğunu geri götür" question="Qaytarma sorğusu ləğv olunacaq." confirmLabel="Bəli">
                          <X size={14} /> Geri götür
                        </ConfirmButton>
                      ) : returnable(h) && (
                        <button type="button" onClick={() => setReturning([h])} className="btn btn-secondary btn-sm !h-8"><Undo2 size={14} /> Qaytar</button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-line bg-surface">
        <div className="flex items-center gap-2 px-5 pb-3 pt-5 max-sm:px-4 max-sm:pb-2 max-sm:pt-3">
          <h2 className="flex-1 text-lg font-bold max-sm:text-base">Sorğularım</h2>
          <span className="muted text-[13px]">son {data.requests.length}</span>
        </div>
        {data.requests.length === 0 ? (
          <p className="muted border-t border-line py-8 text-center text-sm">Hələ sorğu yoxdur.</p>
        ) : (
          <ul className="nice-scroll max-h-[420px] divide-y divide-line overflow-y-auto border-t border-line">
            {data.requests.map((r) => {
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
        </div>
        <aside className="relative min-w-0 max-xl:h-[460px]"><WhoHasCard all={data.all} me={employeeId} /></aside>
      </div>
    </div>
  );
}
