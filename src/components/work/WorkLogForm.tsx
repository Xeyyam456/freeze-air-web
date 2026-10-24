"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ImagePlus, Package, X } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DatePicker } from "@/components/DatePicker";
import { Buttons, Field } from "@/components/forms";
import { Modal } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { norm, PlacePicker, type Place } from "./PlacePicker";
import { toast } from "@/lib/toast";

export type { Place };

// Redaktə üçün mövcud iş
export type ExistingLog = {
  id: number;
  work_date: string;
  description: string;
  place: Place;
  files: { id: number; kind: string; path: string; url?: string }[];
};

// Yeni işin qaralaması (yalnız bu brauzerdə): obyektdə internet kəsiləndə və ya pəncərə təsadüfən bağlananda yazılan itməsin.
// Fayllar saxlanmır (brauzer icazə vermir). Uğurla yazılanda silinir.
type Draft = { work_date?: string; description?: string; place?: Place | null; materials?: Record<number, string> };
// Ustanın üzərindəki material (açıq təhvil): iş qeydində nə qədər işlətdiyini yazır (migrasiya 0060)
type HeldMaterial = { toolId: number; name: string; unit: string; quantity: number };
// Material miqdarı kəsr ola bilər (0085: 2,5 kq): "2,5" və "2.5" ikisi də olur
const toNum = (s: string | undefined) => Math.round((Number(String(s ?? "").trim().replace(",", ".")) || 0) * 100) / 100;
const fmtNum = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");
const draftKey = (employeeId: number) => `worklog-draft:${employeeId}`;
function readDraft(employeeId: number): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(employeeId));
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}
function writeDraft(employeeId: number, d: Draft | null) {
  try {
    if (d) localStorage.setItem(draftKey(employeeId), JSON.stringify(d));
    else localStorage.removeItem(draftKey(employeeId));
  } catch {
    // brauzer yaddaşı bağlıdır: qaralama sadəcə saxlanmır
  }
}

// Bütün yerlər: əvvəl sabit məkanlı şirkətlər, sonra hər şəbəkənin mağazaları koda görə
export async function loadPlaces(): Promise<Place[]> {
  const supabase = createClient();
  const [{ data: stores }, { data: companies }] = await Promise.all([
    supabase.from("stores").select("id, code, name, address, companies(name)"),
    supabase.from("companies").select("id, name, address, stores(count)").eq("kind", "company").order("name"),
  ]);

  // Filialı olmayan şirkətlər özü yerdir (stadion, Port Baku)
  const fixed: Place[] = (companies ?? [])
    .filter((c) => (c.stores[0]?.count ?? 0) === 0)
    .map((c) => ({
      key: `c${c.id}`, storeId: null, companyId: c.id, custom: null,
      group: "Sabit məkanlar", label: c.name, sub: c.address ?? "",
      search: norm(`${c.name} ${c.address}`),
    }));

  const fromStores: Place[] = (stores ?? [])
    .map((s) => {
      const owner = s.companies?.name ?? "";
      return {
        key: `s${s.id}`, storeId: s.id, companyId: null, custom: null,
        group: owner, label: `${s.code} ${s.name}`, sub: s.address ?? "",
        search: norm(`${owner} ${s.code} ${s.name} ${s.address}`),
      };
    })
    .sort((a, b) => a.group.localeCompare(b.group, "az") || a.label.localeCompare(b.label, "az", { numeric: true }));

  return [...fixed, ...fromStores];
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ext(file: File) {
  return file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
}

export function WorkLogForm({ employeeId, employeeName, existing, onClose, onSaved }: {
  employeeId: number;
  employeeName: string;
  existing?: ExistingLog;
  onClose: () => void;
  onSaved: () => void;
}) {
  // Yeni işdə əvvəlki yarımçıq qaralama bərpa olunur (redaktədə qaralama yoxdur)
  const [draft] = useState<Draft | null>(() => (existing ? null : readDraft(employeeId)));
  const [places, setPlaces] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place | null>(existing?.place ?? draft?.place ?? null);
  const formRef = useRef<HTMLFormElement>(null);
  const [held, setHeld] = useState<HeldMaterial[]>([]);
  const [used, setUsed] = useState<Record<number, string>>(draft?.materials ?? {}); // material id → işlədilən miqdar (mətn)
  const usedRef = useRef(used); // qaralama üçün son dəyər (formun onChange-i input-dan sonra köhnə state ilə gəlir)
  const [act, setAct] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [removed, setRemoved] = useState<Set<number>>(new Set()); // silinməsi seçilmiş mövcud fayllar
  const [confirmData, setConfirmData] = useState<FormData | null>(null); // redaktədə təsdiq gözləyən forma
  const [pending, setPending] = useState(false);

  const keptFiles = (existing?.files ?? []).filter((f) => !removed.has(f.id));
  const toggleRemove = (id: number) =>
    setRemoved((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useEffect(() => {
    loadPlaces().then(setPlaces);
  }, []);

  // Üzərimdəki materiallar və (redaktədə) bu işdə əvvəl yazılan sərf
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    Promise.all([
      supabase.from("tool_assignments").select("quantity, tools(id, name, unit, kind)").eq("employee_id", employeeId).is("returned_at", null).then((r) => r.data ?? []),
      existing ? supabase.from("work_log_materials").select("tool_id, amount").eq("work_log_id", existing.id).then((r) => r.data ?? []) : Promise.resolve([]),
    ]).then(([assign, prev]) => {
      if (cancelled) return;
      setHeld(assign.filter((a) => a.tools?.kind === "material").map((a) => ({ toolId: a.tools!.id, name: a.tools!.name, unit: a.tools!.unit, quantity: a.quantity }))
        .sort((a, b) => a.name.localeCompare(b.name, "az")));
      if (prev.length) {
        usedRef.current = Object.fromEntries(prev.map((m) => [m.tool_id, fmtNum(m.amount)]));
        setUsed(usedRef.current);
      }
    });
    return () => { cancelled = true; };
  }, [employeeId, existing]);
  const overused = held.filter((m) => toNum(used[m.toolId]) > m.quantity);

  // Qaralamanı yenilə: mətn yazılanda (form onChange), yer və ya kod seçiləndə
  function saveDraft(next: Partial<Draft> = {}) {
    if (existing || !formRef.current) return;
    const form = new FormData(formRef.current);
    const d: Draft = { work_date: String(form.get("work_date") ?? ""), description: String(form.get("description") ?? ""), place, materials: usedRef.current, ...next };
    writeDraft(employeeId, d.description?.trim() || d.place || Object.values(d.materials ?? {}).some(Boolean) ? d : null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!place) return toast.error("İşin görüldüyü yeri seç.");
    if (!String(form.get("description") ?? "").trim()) return toast.error("Görülən işi yaz.");
    if (overused.length) return toast.error(`${overused[0].name}: üzərində cəmi ${fmtNum(overused[0].quantity)} ${overused[0].unit} var.`);
    // Redaktədə əvvəl "Məlumatların doğruluğunu təsdiq edirsinizmi?" soruşulur
    if (existing) setConfirmData(form);
    else save(form);
  }

  async function save(form: FormData) {
    if (!place) return;
    const description = String(form.get("description") ?? "").trim();
    const fields = {
      work_date: String(form.get("work_date")),
      store_id: place.storeId,
      company_id: place.companyId,
      place_text: place.custom,
      description,
    };

    setPending(true);
    const supabase = createClient();

    let logId: number;
    if (existing) {
      const { error: upErr } = await supabase.from("work_logs").update(fields).eq("id", existing.id);
      if (upErr) {
        setPending(false);
        return toast.error(upErr.message);
      }
      logId = existing.id;
    } else {
      const { data: log, error: logError } = await supabase
        .from("work_logs")
        .insert({ ...fields, employee_id: employeeId })
        .select("id")
        .single();
      if (logError || !log) {
        setPending(false);
        return toast.error(logError?.message ?? "Yadda saxlanmadı.");
      }
      logId = log.id;
    }

    // Silinməsi seçilmiş fayllar; yeni akt seçilibsə köhnə akt da əvəz olunur
    const toRemove = (existing?.files ?? []).filter((f) => removed.has(f.id) || (act && f.kind === "act"));
    if (toRemove.length) {
      await supabase.storage.from("work").remove(toRemove.map((f) => f.path));
      await supabase.from("work_files").delete().in("id", toRemove.map((f) => f.id));
    }

    // Yeni fayllar: work/<log id>/<təsadüfi ad>
    const files = [...(act ? [{ file: act, kind: "act" }] : []), ...photos.map((f) => ({ file: f, kind: "photo" }))];
    const failed: string[] = [];
    for (const { file, kind } of files) {
      const path = `${logId}/${crypto.randomUUID()}.${ext(file)}`;
      const { error: upError } = await supabase.storage.from("work").upload(path, file, { contentType: file.type });
      if (upError) {
        failed.push(file.name);
        continue;
      }
      await supabase.from("work_files").insert({ work_log_id: logId, kind, path });
    }

    // İşlədilən material: əvvəlkilər silinir, sıfırdan böyük olanlar yazılır (yalnız məlumat, depoda say dəyişmir)
    const rows = held.map((m) => ({ work_log_id: logId, tool_id: m.toolId, amount: toNum(used[m.toolId]) })).filter((r) => r.amount > 0);
    if (existing) await supabase.from("work_log_materials").delete().eq("work_log_id", logId);
    if (rows.length) {
      const { error: mErr } = await supabase.from("work_log_materials").insert(rows);
      if (mErr) failed.push("material sərfi");
    }

    setPending(false);
    if (failed.length) {
      // İş yazılıb, amma bəzi fayllar yüklənməyib: istifadəçiyə deyirik, pəncərəni bağlamırıq
      onSaved();
      return toast.error(`İş saxlanıldı, amma bu fayllar yüklənmədi: ${failed.join(", ")}. Fayl 10 MB-dan böyük olmamalı, şəkil və ya PDF olmalıdır.`);
    }
    if (!existing) writeDraft(employeeId, null);
    onSaved();
    toast.success(existing ? "İş yeniləndi" : "İş əlavə edildi");
    onClose();
  }

  return (
    <Modal onClose={onClose} labelledBy="work-form-title" className="!max-w-lg">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="work-form-title" className="text-lg font-bold">{existing ? "İşi redaktə et" : "Yeni iş"}</h2>
          <p className="muted text-sm">{employeeName}</p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      <form ref={formRef} onSubmit={onSubmit} onChange={() => saveDraft()} className="space-y-4">
        {draft && (
          <p className="flex items-center justify-between gap-3 rounded-xl bg-primary-soft px-3 py-2 text-xs font-semibold text-primary">
            Yarımçıq qalan iş bərpa olundu (şəkillər saxlanmır).
            <button type="button" className="underline" onClick={() => { writeDraft(employeeId, null); onClose(); }}>Qaralamanı sil</button>
          </p>
        )}
        <Field label="Tarix">
          <DatePicker name="work_date" defaultValue={existing?.work_date ?? draft?.work_date ?? today()} max={today()} required />
        </Field>

        <div>
          <span className="label">Yer</span>
          <PlacePicker places={places} value={place} onChange={(p) => { setPlace(p); saveDraft({ place: p }); }} />
        </div>

        <Field label="Görülən iş">
          <textarea name="description" rows={3} required className="field resize-none" defaultValue={existing?.description ?? draft?.description}
            placeholder="Məs. 2 ədəd split kondisionerin profilaktikası, freon dolduruldu" />
        </Field>


        {/* Üzərimdəki materialdan bu işdə nə qədər işlətdim (istəyə görə): depo məsulu təhvildə görür */}
        {held.length > 0 && (
          <div>
            <span className="label">İşlədilən material <span className="muted font-normal">(istəyə görə)</span></span>
            <ul className="divide-y divide-line rounded-xl border border-line">
              {held.map((m) => {
                const over = toNum(used[m.toolId]) > m.quantity;
                return (
                  <li key={m.toolId} className="flex items-center gap-3 px-3 py-2 max-sm:gap-2">
                    <Package size={15} className="shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-semibold">{m.name}</span>
                      <span className={`block whitespace-nowrap text-[11px] ${over ? "font-semibold text-danger" : "muted"}`}>Məndə: {fmtNum(m.quantity)} {m.unit}</span>
                    </span>
                    <input inputMode="decimal" autoComplete="off" value={used[m.toolId] ?? ""} placeholder="0"
                      onChange={(e) => { usedRef.current = { ...usedRef.current, [m.toolId]: e.target.value }; setUsed(usedRef.current); }}
                      className={`field !h-9 !w-20 text-center max-sm:!w-16 max-sm:!px-1 ${over ? "!border-danger" : ""}`} aria-label={`${m.name}: işlədilən miqdar`} />
                    <span className="muted w-10 text-xs max-sm:w-auto">{m.unit}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Redaktədə mövcud fayllar: × ilə silinməyə işarələnir, saxlayanda silinir */}
        {existing && existing.files.length > 0 && (
          <div>
            <span className="label">Mövcud fayllar</span>
            <div className="flex flex-wrap gap-2">
              {existing.files.map((f) => {
                const gone = removed.has(f.id);
                return (
                  <div key={f.id} className={`relative ${gone ? "opacity-40" : ""}`}>
                    {f.kind === "act" ? (
                      <span className="flex h-14 items-center gap-1.5 rounded-lg border border-line bg-bg px-3 text-xs font-semibold">
                        <FileText size={16} className="text-primary" /> Akt
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- imzalı storage linki
                      <img src={f.url} alt="İşin şəkli" className="h-14 w-14 rounded-lg border border-line object-cover" />
                    )}
                    <button type="button" onClick={() => toggleRemove(f.id)}
                      className={`absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full text-white shadow ${gone ? "bg-muted" : "bg-danger"}`}
                      title={gone ? "Silməni ləğv et" : "Sil"} aria-label={gone ? "Silməni ləğv et" : "Faylı sil"}>
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
            {removed.size > 0 && <p className="mt-1 text-xs text-danger">{removed.size} fayl yadda saxlayanda silinəcək.</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-3 py-3 text-center hover:border-primary">
            <FileText size={18} className="text-primary" />
            <span className="text-sm font-semibold">Akt</span>
            <span className="muted w-full truncate text-xs">{act ? act.name : keptFiles.some((f) => f.kind === "act") ? "yenisi köhnəni əvəz edir" : "şəkil və ya PDF"}</span>
            <input type="file" accept="image/*,application/pdf" className="sr-only"
              onChange={(e) => setAct(e.target.files?.[0] ?? null)} />
          </label>
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-line px-3 py-3 text-center hover:border-primary">
            <ImagePlus size={18} className="text-primary" />
            <span className="text-sm font-semibold">İşin şəkilləri</span>
            <span className="muted text-xs">{photos.length ? `${photos.length} şəkil seçildi` : "bir neçə şəkil"}</span>
            <input type="file" accept="image/*" multiple className="sr-only"
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} />
          </label>
        </div>

        <Buttons pending={pending} label={existing ? "Yadda saxla" : "İşi yadda saxla"} onCancel={onClose} />
        <ConfirmModal
          open={!!confirmData}
          title="Məlumatların doğruluğunu təsdiq edirsinizmi?"
          message="İşdəki dəyişikliklər yadda saxlanılacaq."
          confirmLabel="Bəli, yadda saxla"
          onCancel={() => setConfirmData(null)}
          onConfirm={() => {
            const form = confirmData;
            setConfirmData(null);
            if (form) save(form);
          }}
        />
      </form>
    </Modal>
  );
}
