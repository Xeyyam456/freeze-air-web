"use client";

import { useState } from "react";
import { Check, CircleAlert, Clock, Hand, Package, Send, Undo2, Wrench, X } from "lucide-react";
import { useLoggedUse } from "@/components/depot/Approvals";
import { dateAz, daysSince, fmt, isPacked, norm, parseQty, pieceWord, REQUEST_TYPES, round2, showQty, timeAz, withUnit, type DepotRequest, type Tool } from "@/components/depot/depotUtils";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Field } from "@/components/forms";
import { Modal } from "@/components/Modal";
import { ToolPicker } from "@/components/ToolPicker";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { useData } from "@/lib/useData";

// Alətlərim (usta paneli, 0084): üzərimdəki alət və materiallar. Usta depoya özü heç nə qoya bilmir:
// verilən aləti "Aldım / Almadım" ilə təsdiqləyir, qaytarmaq və ya yeni alət istəmək üçün sorğu yazır;
// depo məsulu və ya admin qəbul edəndə say dəyişir. Hadisələr Realtime ilə gəlir (TasksListener → revalidate()).

type Mine = {
  id: number; tool_id: number; quantity: number; taken_at: string; received_at: string | null; disputed_at: string | null;
  tools: Pick<Tool, "name" | "kind" | "unit" | "pack_name" | "pack_size"> | null;
};

async function fetchMine(employeeId: number) {
  const supabase = createClient();
  const [{ data: holds }, { data: requests }, { data: stock }] = await Promise.all([
    supabase.from("tool_assignments").select("id, tool_id, quantity, taken_at, received_at, disputed_at, tools(name, kind, unit, pack_name, pack_size)")
      .eq("employee_id", employeeId).is("returned_at", null).order("taken_at"),
    supabase.from("depot_requests").select("*").eq("employee_id", employeeId).in("type", ["return", "request", "writeoff"])
      .order("created_at", { ascending: false }).limit(60),
    supabase.from("tool_stock").select("*").order("name"),
  ]);
  return { holds: (holds ?? []) as Mine[], requests: (requests ?? []) as DepotRequest[], stock: (stock ?? []) as Tool[] };
}

const STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Gözləyir", tone: "bg-[#fff4e0] text-[#b45309]" },
  approved: { label: "Qəbul edildi", tone: "bg-ok-soft text-ok" },
  rejected: { label: "Rədd edildi", tone: "bg-danger-soft text-danger" },
  cancelled: { label: "Ləğv olundu", tone: "bg-bg text-muted" },
};

function requestLine(r: DepotRequest) {
  const u = r.tool_kind === "material" ? r.unit : "ədəd";
  if (r.type === "return") return r.tool_kind === "material" ? `qaytarma: işlətdim ${fmt(r.used ?? 0)}, qaytarıram ${fmt(r.returned ?? 0)} ${u}` : `qaytarma: ${fmt(r.quantity ?? 0)} ${u}`;
  if (r.type === "request") return `istək: ${fmt(r.quantity ?? 0)} ${u}`;
  return `silinmə aktı: ${fmt(r.quantity ?? 0)} ${u}`;
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

function Stat({ label, value, tone = "" }: { label: string; value: number; tone?: string }) {
  return (
    <div>
      <dt className="text-xs text-white/55">{label}</dt>
      <dd className={`text-2xl font-extrabold tabular-nums ${tone}`}>{value}</dd>
    </div>
  );
}

// Qaytarma sorğusu: alətdə say; materialda nə qədər qaytarıram (kq və ya balon) və qalanı işlətdim, ya da məndə qalır.
// Qaz: 1 balon (11,3 kq) götürdüm, 3 kq işlətdim → "Qaytarıram 8,3 kq", "Qalanı: işlətdim". İş qeydlərindəki sərf ipucu kimi.
function ReturnModal({ h, employeeId, onClose }: { h: Mine; employeeId: number; onClose: () => void }) {
  const t = h.tools!;
  const material = t.kind === "material";
  const u = material ? t.unit : "ədəd";
  const packed = isPacked(t);
  const [qty, setQty] = useState(String(h.quantity));
  const [retText, setRetText] = useState("");
  const [byPack, setByPack] = useState(false);
  const [restUsed, setRestUsed] = useState(true);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const logged = useLoggedUse(employeeId, h.tool_id, h.taken_at, material);
  const typed = parseQty(retText);
  const ret = round2((Number.isNaN(typed) ? 0 : typed) * (packed && byPack ? t.pack_size : 1));
  const rest = round2(h.quantity - ret);
  const used = restUsed ? Math.max(0, rest) : 0;
  const over = material ? rest < 0 : parseQty(qty) > h.quantity;
  const empty = material ? ret === 0 && used === 0 : !(parseQty(qty) > 0);
  const openPart = packed ? round2(ret - Math.floor(round2(ret / t.pack_size)) * t.pack_size) : 0;
  const hint = over ? "Səndə olandan çox ola bilməz."
    : [
      used > 0 && `işlətdim ${fmt(used)} ${u}`,
      ret > 0 && `qaytarıram ${fmt(ret)} ${u}${openPart > 0 ? ` (${fmt(openPart)} ${u} ${pieceWord(t)})` : ""}`,
      !restUsed && rest > 0 && `məndə qalır ${fmt(rest)} ${u}`,
    ].filter(Boolean).join(" · ");

  async function submit() {
    if (over) return toast.error(`Səndə cəmi ${showQty(h.quantity, u, t)} var.`);
    setPending(true);
    const ok = await rpc(() => createClient().rpc("depot_return_create", {
      p_assignment_id: h.id, p_quantity: material ? undefined : parseQty(qty), p_used: material ? used : undefined,
      p_returned: material ? ret : undefined, p_note: note.trim() || undefined,
    }), "Qaytarma sorğusu göndərildi: depo qəbul edəndə səndən çıxacaq");
    setPending(false);
    if (ok) onClose();
  }

  const seg = (on: boolean) => `h-9 flex-1 rounded-lg px-3 text-[13px] font-semibold transition-colors ${on ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`;
  return (
    <Modal onClose={onClose} labelledBy="return-title" className="!max-w-md">
      <div className="mb-5 flex items-center gap-3">
        <span className="icon-tile !h-9 !w-9 shrink-0"><Undo2 size={17} /></span>
        <div className="min-w-0 flex-1">
          <h2 id="return-title" className="truncate text-lg font-bold leading-tight">Qaytar: {t.name}</h2>
          <p className="muted text-[13px]">Səndə {showQty(h.quantity, u, t)}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <div className="space-y-4">
        {material ? (
          <>
            <div>
              <span className="label">Qaytarıram</span>
              <div className="flex gap-2">
                <input value={retText} onChange={(e) => setRetText(e.target.value)} inputMode="decimal" placeholder="0" autoFocus autoComplete="off"
                  aria-label="Qaytarıram" className={`field !w-32 ${over ? "!border-danger" : ""}`} />
                {packed ? (
                  <div className="flex flex-1 gap-1 rounded-xl bg-line/60 p-1" role="tablist" aria-label="Vahid">
                    <button type="button" role="tab" aria-selected={!byPack} onClick={() => setByPack(false)} className={seg(!byPack)}>{t.unit}</button>
                    <button type="button" role="tab" aria-selected={byPack} onClick={() => setByPack(true)} className={seg(byPack)}>{t.pack_name}</button>
                  </div>
                ) : (
                  <span className="muted self-center text-sm">{u}</span>
                )}
              </div>
            </div>
            <div>
              <span className="label">Qalanı</span>
              <div className="flex gap-1 rounded-xl bg-line/60 p-1" role="tablist" aria-label="Qalanı">
                <button type="button" role="tab" aria-selected={restUsed} onClick={() => setRestUsed(true)} className={seg(restUsed)}>İşlətdim</button>
                <button type="button" role="tab" aria-selected={!restUsed} onClick={() => setRestUsed(false)} className={seg(!restUsed)}>Məndə qalır</button>
              </div>
            </div>
            {logged !== null && logged > 0 && (
              <p className="rounded-lg bg-bg px-3 py-2 text-xs">İş qeydlərində yazdığın: <b>{fmt(logged)} {u}</b></p>
            )}
            {hint && <p className={`text-xs ${over ? "font-semibold text-danger" : "muted"}`}>{hint}</p>}
          </>
        ) : (
          <Field label={`Neçə ədəd (səndə ${h.quantity})`}>
            <input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} className={`field !w-32 ${over ? "!border-danger" : ""}`} />
          </Field>
        )}
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Qeyd (istəyə görə)" aria-label="Qeyd" className="field" />
        <div className="flex gap-2">
          <button type="button" disabled={pending || over || empty} onClick={submit} className="btn btn-primary flex-1"><Send size={15} /> Sorğu göndər</button>
          <button type="button" onClick={onClose} className="btn btn-cancel">Ləğv et</button>
        </div>
      </div>
    </Modal>
  );
}

// Alət istə: depoda boş olanlardan seç (boş olmayanı da istəmək olar: depo məsulu alanda verər)
function AskModal({ stock, onClose }: { stock: Tool[]; onClose: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const tool = stock.find((t) => t.id === picked) ?? null;

  async function submit() {
    if (!tool) return toast.error("Alət və ya material seç.");
    setPending(true);
    const ok = await rpc(() => createClient().rpc("depot_request_create", { p_tool_id: tool.id, p_quantity: parseQty(qty), p_note: note.trim() || undefined }),
      "İstək göndərildi: depo məsulu təsdiqləyəndə sənə veriləcək");
    setPending(false);
    if (ok) onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="ask-title" className="!max-w-md">
      <div className="mb-4 flex items-start gap-3">
        <span className="icon-tile !h-10 !w-10 shrink-0"><Hand size={18} /></span>
        <div className="min-w-0 flex-1">
          <h2 id="ask-title" className="text-lg font-bold">Alət və ya material istə</h2>
          <p className="muted text-[13px]">Depo məsulu və ya admin təsdiqləyəndə sənə verilir, sonra «Aldım» basırsan.</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>
      <div className="space-y-4">
        <Field label="Nə lazımdır">
          <ToolPicker items={stock.map((t) => ({ id: t.id, name: t.name, hint: t.available > 0 ? `depoda ${withUnit(t.available, t)}` : "depoda yoxdur" }))}
            value={picked} onChange={setPicked} placeholder="Seç..." emptyLabel="Depo boşdur" searchLabel="Axtar..." />
        </Field>
        <div className="flex items-end gap-3">
          <Field label="Miqdar">
            <input inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} autoComplete="off" className="field !w-32" />
          </Field>
          <span className="muted pb-3 text-sm">{tool ? (tool.kind === "material" ? tool.unit : "ədəd") : ""}</span>
        </div>
        <Field label="Nə üçün (istəyə görə)">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Məs. sabah Rabitə Bank işi" className="field" />
        </Field>
        <div className="flex gap-2">
          <button type="button" disabled={pending || !tool} onClick={submit} className="btn btn-primary flex-1"><Send size={15} /> İstə</button>
          <button type="button" onClick={onClose} className="btn btn-cancel">Ləğv et</button>
        </div>
      </div>
    </Modal>
  );
}

export function MyTools({ employeeId }: { employeeId: number | null }) {
  const data = useData(() => (employeeId ? fetchMine(employeeId) : Promise.resolve(null)), [employeeId]);
  const [returning, setReturning] = useState<Mine | null>(null);
  const [asking, setAsking] = useState(false);
  const [query, setQuery] = useState("");

  if (!employeeId) return <div className="card muted py-10 text-center text-sm">Hesabın əməkdaş kartına bağlı deyil.</div>;
  if (!data) return <div className="card muted">Yüklənir...</div>;

  const toConfirm = data.holds.filter((h) => !h.received_at);
  const pendingReturn = new Map(data.requests.filter((r) => r.type === "return" && r.status === "pending").map((r) => [r.assignment_id, r]));
  const pendingReq = data.requests.filter((r) => r.status === "pending");
  const tools = data.holds.filter((h) => h.tools?.kind !== "material");
  const materials = data.holds.filter((h) => h.tools?.kind === "material");
  const shown = (list: Mine[]) => list.filter((h) => norm(h.tools?.name).includes(norm(query.trim())));

  const row = (h: Mine) => {
    const t = h.tools!;
    const u = t.kind === "material" ? t.unit : "ədəd";
    const ret = pendingReturn.get(h.id);
    const d = daysSince(h.taken_at);
    return (
      <li key={h.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-line bg-surface px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          {t.kind === "material" ? <Package size={17} /> : <Wrench size={17} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{t.name}</span>
          <span className="muted block text-xs">götürdün {dateAz(h.taken_at)} · {d === 0 ? "bu gün" : `${d} gün`}</span>
        </span>
        <span className="text-sm font-bold tabular-nums text-primary">{showQty(h.quantity, u, t)}</span>
        {!h.received_at ? (
          <span className="rounded-full bg-[#fff4e0] px-2.5 py-1 text-[11px] font-bold text-[#b45309]">{h.disputed_at ? "«Almadım» dedin" : "təsdiqlə ↑"}</span>
        ) : ret ? (
          <span className="flex items-center gap-1.5">
            <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">qaytarma gözləyir</span>
            <ConfirmButton onConfirm={async () => { await rpc(() => createClient().rpc("depot_request_cancel", { p_id: ret.id }), "Sorğu ləğv edildi"); }} success={false}
              className="icon-btn !h-8 !w-8" title="Sorğunu geri götür" question="Qaytarma sorğusu ləğv olunacaq." confirmLabel="Bəli">
              <X size={14} />
            </ConfirmButton>
          </span>
        ) : (
          <button type="button" onClick={() => setReturning(h)} className="btn btn-secondary btn-sm !h-8"><Undo2 size={14} /> Qaytar</button>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-5">
      {returning && <ReturnModal h={returning} employeeId={employeeId} onClose={() => setReturning(null)} />}
      {asking && <AskModal stock={data.stock} onClose={() => setAsking(false)} />}

      <section className="flex flex-wrap items-center gap-x-10 gap-y-4 rounded-[18px] bg-[linear-gradient(120deg,#0b1324,#11243a_55%,#0f3d4c)] px-6 py-5 text-white">
        <dl className="flex flex-1 flex-wrap gap-x-10 gap-y-3">
          <Stat label="Məndə alət" value={tools.reduce((n, h) => n + h.quantity, 0)} tone="text-frost" />
          <Stat label="Material növü" value={materials.length} />
          <Stat label="Təsdiqləməliyəm" value={toConfirm.length} tone={toConfirm.length ? "text-amber-400" : ""} />
          <Stat label="Gözləyən sorğu" value={pendingReq.length} tone={pendingReq.length ? "text-amber-400" : ""} />
        </dl>
        <button type="button" onClick={() => setAsking(true)} className="btn !h-10 bg-white text-navy hover:bg-white/90 max-sm:w-full"><Hand size={16} /> Alət istə</button>
      </section>

      {toConfirm.length > 0 && (
        <section className="rounded-[18px] border border-[#fde3b4] bg-[#fffaf0] p-4">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-bold"><CircleAlert size={16} className="text-[#b45309]" /> Sənə verildi: təsdiqlə</h2>
          <p className="muted mb-3 text-xs">Əlinə çatıbsa «Aldım» bas. Çatmayıbsa «Almadım»: depo məsulu yoxlayacaq.</p>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {toConfirm.map((h) => {
              const t = h.tools!;
              const u = t.kind === "material" ? t.unit : "ədəd";
              return (
                <li key={h.id} className="flex flex-col rounded-2xl border border-line bg-surface p-4">
                  <p className="truncate text-[15px] font-bold">{t.name}</p>
                  <p className="text-[13px] font-semibold text-primary">{showQty(h.quantity, u, t)}</p>
                  <p className="muted text-xs">{dateAz(h.taken_at)} · {timeAz(h.taken_at)}{h.disputed_at ? " · «Almadım» dedin, depo yoxlayır" : ""}</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => rpc(() => createClient().rpc("assignment_confirm", { p_id: h.id, p_received: true }), "Təsdiqləndi: aldın")}
                      className="btn btn-primary btn-sm !h-9 flex-1"><Check size={15} /> Aldım</button>
                    {!h.disputed_at && (
                      <ConfirmButton onConfirm={async () => { await rpc(() => createClient().rpc("assignment_confirm", { p_id: h.id, p_received: false }), "Depo məsuluna bildirildi"); }}
                        success={false} className="btn btn-cancel btn-sm !h-9" title="Almadım" question="Depo məsulu yoxlayacaq. Sonra yenə «Aldım» basa bilərsən." confirmLabel="Bəli, almamışam">
                        Almadım
                      </ConfirmButton>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">Məndə olanlar</h2>
          {data.holds.length > 5 && (
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Axtar..." aria-label="Axtar" className="field !h-9 !w-56 !text-sm max-sm:!w-full" />
          )}
        </div>
        {data.holds.length === 0 ? (
          <div className="card muted py-10 text-center text-sm">Üzərində alət və material yoxdur. Lazımdırsa «Alət istə».</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Alətlər ({tools.length})</h3>
              {tools.length === 0 ? <p className="muted text-sm">Yoxdur.</p> : <ul className="space-y-2">{shown(tools).map(row)}</ul>}
            </div>
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Materiallar ({materials.length})</h3>
              {materials.length === 0 ? <p className="muted text-sm">Yoxdur.</p> : <ul className="space-y-2">{shown(materials).map(row)}</ul>}
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">Sorğularım</h2>
        {data.requests.length === 0 ? (
          <div className="card muted py-8 text-center text-sm">Hələ sorğu yoxdur.</div>
        ) : (
          <ul className="card divide-y divide-line !p-0">
            {data.requests.map((r) => {
              const s = STATUS[r.status] ?? STATUS.pending;
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${REQUEST_TYPES[r.type]?.tone ?? ""}`}>{REQUEST_TYPES[r.type]?.label}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{r.tool_name}</span>
                    <span className="muted block text-xs">
                      {requestLine(r)} · {dateAz(r.created_at)}
                      {r.decided_by_name && ` · ${r.decided_by_name}`}{r.decision_note ? ` · “${r.decision_note}”` : ""}
                    </span>
                  </span>
                  <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.tone}`}>
                    {r.status === "pending" && <Clock size={11} />} {s.label}
                  </span>
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
  );
}
