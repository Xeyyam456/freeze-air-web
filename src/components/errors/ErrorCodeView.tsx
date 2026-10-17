"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, TriangleAlert, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Code = { id: number; model_series: string | null; code: string; title: string; solution: string | null };

const norm = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");

// Xəta kodları (yalnız baxış; admin paneldən idarə olunur): kod və ya model yazıb tez tapmaq
export function ErrorCodeView() {
  const [codes, setCodes] = useState<Code[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    createClient().from("ac_error_codes").select("id, model_series, code, title, solution")
      .order("model_series", { nullsFirst: false }).order("code")
      .then(({ data }) => { if (!cancelled) setCodes(data ?? []); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    return (codes ?? []).filter((c) => {
      const hay = norm(`${c.model_series} ${c.code} ${c.title} ${c.solution}`);
      return words.every((w) => hay.includes(w));
    });
  }, [codes, query]);

  return (
    <div className="space-y-4">
      <div className="search">
        <Search size={20} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Model və ya xəta kodu yaz (məs. E5)..." aria-label="Xəta kodu axtarışı" />
      </div>

      {codes === null ? (
        <div className="card muted py-10 text-center text-sm">Yüklənir...</div>
      ) : codes.length === 0 ? (
        <div className="card py-14 text-center">
          <span className="icon-tile mx-auto"><TriangleAlert size={20} /></span>
          <p className="mt-3 font-semibold">Hələ xəta kodu əlavə olunmayıb</p>
          <p className="muted text-sm">Xəta kodlarını admin əlavə edir.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card muted py-10 text-center text-sm">Heç nə tapılmadı.</div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {filtered.map((c) => (
            <li key={c.id} className="card space-y-3">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-danger-soft px-3 py-2 text-lg font-extrabold text-danger">{c.code}</span>
                <div className="min-w-0 flex-1">
                  <p className="muted text-xs font-semibold">{c.model_series ?? "Bütün modellər"}</p>
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
