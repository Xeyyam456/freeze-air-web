import { useMemo, useState } from "react";
import { useData } from "@/lib/useData";
import { fetchCodes } from "@/services/errorCodes/fetchCodes";
import type { ErrorCode, ErrorCodesState } from "@/types/errorCodes";
import { ERROR_CODES_KEY } from "../queries/keys";
import { compareCodes } from "../utils/compareCodes";
import { isCodeQuery } from "../utils/isCodeQuery";
import { matchCodes } from "../utils/matchCodes";

// Xəta kodları ekranının vəziyyəti: model, axtarış (pult ekranı), seçilmiş kod və qonşuları.
// 2 simvollu kod yazılanda həmin kod özü seçilir; sözlə axtarışda xəritədə uyğunlar işıqlanır.
export function useErrorCodes(): ErrorCodesState | null {
  const data = useData(ERROR_CODES_KEY, () => fetchCodes());
  const [picked, setModelId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false); // sahədəki kod kliklə gəlib: növbəti simvol yeni kod başladır

  const counts = useMemo(() => {
    const m = new Map<number, number>();
    for (const c of data?.codes ?? []) m.set(c.model_id, (m.get(c.model_id) ?? 0) + 1);
    return m;
  }, [data]);
  // Standart model: ən çox kodu olan
  const modelId = picked ?? [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const codes = useMemo(
    () => (data?.codes ?? []).filter((c) => c.model_id === modelId).sort((a, b) => compareCodes(a.code, b.code)),
    [data, modelId],
  );
  const matches = useMemo(() => matchCodes(codes, query), [codes, query]);

  if (!data) return null;
  const q = query.trim().toUpperCase();
  const codeQuery = isCodeQuery(q);
  const exact = codeQuery && q.length === 2 ? codes.find((c) => c.code === q) ?? null : null;
  const pickedCode = codes.find((c) => c.id === pickedId) ?? null;
  const selected = codeQuery ? exact ?? (pickedCode?.code.startsWith(q) ? pickedCode : null) : pickedCode;
  const at = selected ? codes.indexOf(selected) : -1;
  const names = new Map(data.models.map((m) => [m.id, m.name]));
  const shown = selected?.code ?? (codeQuery ? q : "");

  const select = (c: ErrorCode) => {
    if (c.model_id !== modelId) setModelId(c.model_id);
    setPickedId(c.id);
    if (codeQuery || !q) { setQuery(c.code); setRolling(true); }
  };

  return {
    models: data.models,
    counts,
    modelId,
    modelName: names.get(modelId ?? -1) ?? "",
    setModelId: (id) => { setModelId(id); setPickedId(null); },
    query,
    // Pult kimi: kod kliklə seçilib sonra simvol yazılırsa, kod sıfırdan başlayır (U4 → yaz "E" → E)
    setQuery: (next) => {
      setRolling(false);
      setQuery(rolling && next.length === query.length + 1 && next.startsWith(query) ? next.slice(-1) : next);
    },
    codes,
    matches,
    results: !q || codeQuery ? null : codes.filter((c) => matches?.has(c.id)),
    selected,
    twins: selected
      ? data.codes.filter((c) => c.code === selected.code && c.model_id !== modelId).map((code) => ({ modelName: names.get(code.model_id) ?? "", code }))
      : [],
    prev: at > 0 ? codes[at - 1] : null,
    next: at >= 0 && at < codes.length - 1 ? codes[at + 1] : null,
    display: shown,
    select,
  };
}
