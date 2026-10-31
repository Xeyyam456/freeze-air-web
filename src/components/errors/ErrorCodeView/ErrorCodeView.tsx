"use client";

import { useMemo, useState } from "react";
import { Box, Search, TriangleAlert, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/lib/useData";
import type { ErrorModel } from "@/types/errorCodes";
import type { ErrorCode } from "@/types/errorCodes";

const norm = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");

// Xəta kodları (yalnız baxış; admin paneldən idarə olunur): modeli dropdown-dan seç, kodları gör; kod/açıqlama yazıb da axtarmaq olar
// Keşdə: kodlar nadir dəyişir, səhifəyə qayıdanda dərhal görünür
async function fetchCodes(): Promise<{ models: ErrorModel[]; codes: ErrorCode[] }> {
  const supabase = createClient();
  const [models, codes] = await Promise.all([
    supabase.from("ac_models").select("id, name").order("name").then((r) => r.data ?? []),
    supabase.from("ac_error_codes").select("id, model_id, code, title, solution").order("code").then((r) => r.data ?? []),
  ]);
  return { models: models.sort((a, b) => a.name.localeCompare(b.name, "az")), codes };
}

export function ErrorCodeView() {
  const data = useData("error-codes", fetchCodes);
  const [modelId, setModelId] = useState("");
  const [query, setQuery] = useState("");

  const names = useMemo(() => new Map((data?.models ?? []).map((m) => [m.id, m.name])), [data]);
  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return (data?.codes ?? []).filter((c) => {
      if (modelId && String(c.model_id) !== modelId) return false;
      const hay = norm(`${names.get(c.model_id)} ${c.code} ${c.title} ${c.solution}`);
      return words.every((w) => hay.includes(w));
    });
  }, [data, modelId, query, names]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <label className="relative block w-full sm:w-72">
          <Box size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
          <select value={modelId} onChange={(e) => setModelId(e.target.value)} aria-label="Kondisioner modeli"
            className="field !h-14 cursor-pointer !rounded-[14px] !pl-11 font-semibold">
            <option value="">Bütün modellər</option>
            {(data?.models ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        <div className="search min-w-0 flex-1 sm:min-w-64">
          <Search size={20} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Xəta kodu və ya açıqlama yaz (məs. U4)..." aria-label="Xəta kodu axtarışı" />
        </div>
      </div>

      {data === null ? (
        <div className="card muted py-10 text-center text-sm">Yüklənir...</div>
      ) : data.codes.length === 0 ? (
        <div className="card py-14 text-center">
          <span className="icon-tile mx-auto"><TriangleAlert size={20} /></span>
          <p className="mt-3 font-semibold">Hələ xəta kodu əlavə olunmayıb</p>
          <p className="muted text-sm">Xəta kodlarını admin əlavə edir.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card muted py-10 text-center text-sm">Bu modeldə heç nə tapılmadı.</div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {filtered.map((c) => (
            <li key={c.id} className="card space-y-3">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-danger-soft px-3 py-2 text-lg font-extrabold text-danger">{c.code}</span>
                <div className="min-w-0 flex-1">
                  <p className="muted text-xs font-semibold">{names.get(c.model_id) ?? "—"}</p>
                  <p className="font-bold leading-snug">{c.title}</p>
                </div>
              </div>
              {c.solution && (
                <div className="rounded-xl bg-primary-soft/60 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-primary"><Wrench size={13} /> Edilecək iş</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed">{c.solution}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
