"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Building2, CalendarOff, CornerDownLeft, Plus, Search, Store, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEscapeLayer } from "@/components/Modal";
import { emitPanel, navGroups, PANEL_EVENTS } from "./nav";

type Item = { key: string; group: string; label: string; hint?: string; icon: LucideIcon; run: () => void };

// "Nərimanov" və "nerimanov" eyni tapılsın (UnitList-dəki kimi)
function norm(s: string | null | undefined) {
  return (s ?? "")
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ç/g, "c").replace(/ş/g, "s").replace(/ğ/g, "g");
}

type Found = { companies: { id: number; name: string; kind: string }[]; stores: { id: number; code: string | null; name: string; address: string | null; company_id: number; companies: { name: string; kind: string } | null }[] };

// Ctrl+K: səhifələr, tez əməllər (iş əlavə et, icazə istə) və bazadan şirkət / market / mağaza axtarışı.
// ↑ ↓ ilə seçilir, Enter açır, Esc bağlayır.
export function CommandMenu({ showDepot, onClose }: { showDepot: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  useEscapeLayer(onClose);

  const go = (href: string) => () => {
    onClose();
    router.push(href);
  };
  const act = (name: (typeof PANEL_EVENTS)[keyof typeof PANEL_EVENTS]) => () => {
    onClose();
    emitPanel(name);
  };

  // Bazada axtarış: 2 hərfdən sonra, yazmağa fasilə verəndə
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const timer = setTimeout(async () => {
      const supabase = createClient();
      // Söz-söz: "arz 01" → hər söz ad, kod və ya ünvanda olmalıdır (ARZ-001 tapılır)
      const words = q.replace(/[%_,()*]/g, " ").split(/\s+/).filter(Boolean);
      let companyQuery = supabase.from("companies").select("id, name, kind");
      let storeQuery = supabase.from("stores").select("id, code, name, address, company_id, companies(name, kind)");
      for (const w of words) {
        companyQuery = companyQuery.ilike("name", `%${w}%`);
        storeQuery = storeQuery.or(`name.ilike.%${w}%,code.ilike.%${w}%,address.ilike.%${w}%`);
      }
      const [{ data: companies }, { data: stores }] = await Promise.all([
        companyQuery.order("name").limit(5),
        storeQuery.order("code").limit(8),
      ]);
      setFound({ companies: companies ?? [], stores: (stores ?? []) as Found["stores"] });
      setActive(0);
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  const items = useMemo<Item[]>(() => {
    const words = norm(query).split(/\s+/).filter(Boolean);
    const match = (s: string) => words.every((w) => norm(s).includes(w));
    const actions: Item[] = [
      { key: "a:work", group: "Tez əməllər", label: "İş əlavə et", hint: "Görülən işi yaz", icon: Plus, run: act(PANEL_EVENTS.addWork) },
      { key: "a:leave", group: "Tez əməllər", label: "İcazə istə", hint: "İcazə sorğusu göndər", icon: CalendarOff, run: act(PANEL_EVENTS.leave) },
    ];
    const pages: Item[] = navGroups(showDepot).flatMap((g) =>
      g.items.map((i) => ({ key: `p:${i.href}`, group: "Səhifələr", label: i.label, hint: i.hint, icon: i.icon, run: go(i.href) })));
    const local = [...actions, ...pages].filter((i) => match(`${i.label} ${i.hint ?? ""}`));
    if (query.trim().length < 2 || !found) return local;

    const route = (kind: string) => (kind === "market" ? "/magazalar" : "/sirketler");
    const companies: Item[] = found.companies.map((c) => ({
      key: `c:${c.id}`, group: "Şirkət və marketlər", label: c.name, hint: c.kind === "market" ? "Market" : "Şirkət",
      icon: c.kind === "market" ? Store : Building2, run: go(`${route(c.kind)}/${c.id}`),
    }));
    const stores: Item[] = found.stores.map((s) => ({
      key: `s:${s.id}`, group: "Mağaza və filiallar", label: [s.code, s.name].filter(Boolean).join(" · "),
      hint: [s.companies?.name, s.address].filter(Boolean).join(" — "), icon: Store,
      run: go(`${route(s.companies?.kind ?? "company")}/${s.company_id}?q=${encodeURIComponent(s.code || s.name)}`),
    }));
    return [...local, ...companies, ...stores];
    // go/act hər renderdə yenidir, amma yalnız onClose və router-dən asılıdır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, found, showDepot]);

  const current = Math.min(active, Math.max(items.length - 1, 0));

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (current + (e.key === "ArrowDown" ? 1 : -1) + items.length) % Math.max(items.length, 1);
      setActive(next);
      listRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[current]?.run();
    }
  }

  let lastGroup = "";
  return createPortal(
    <div className="cmdk-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Axtarış">
        <div className="cmdk-input">
          <Search size={20} className="shrink-0 text-muted" />
          <input autoFocus value={query} onKeyDown={onKeyDown} placeholder="Səhifə, əməl, şirkət, mağaza kodu…"
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              if (e.target.value.trim().length < 2) setFound(null);
            }} />
          <kbd>Esc</kbd>
        </div>
        <div ref={listRef} className="cmdk-list nice-scroll" role="listbox" aria-label="Nəticələr">
          {items.length === 0 && <p className="muted px-4 py-10 text-center text-sm">Heç nə tapılmadı</p>}
          {items.map((item, i) => {
            const head = item.group !== lastGroup ? (lastGroup = item.group) : null;
            const Icon = item.icon;
            return (
              <div key={item.key}>
                {head && <p className="cmdk-group">{head}</p>}
                <button type="button" role="option" data-index={i} className="cmdk-item" aria-selected={i === current}
                  onMouseMove={() => i !== current && setActive(i)} onClick={item.run}>
                  <span className="cmdk-icon"><Icon size={17} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{item.label}</span>
                    {item.hint && <span className="block truncate text-xs text-muted">{item.hint}</span>}
                  </span>
                  {i === current && <CornerDownLeft size={15} className="shrink-0 text-muted" />}
                </button>
              </div>
            );
          })}
        </div>
        <div className="cmdk-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> seç</span>
          <span><kbd>Enter</kbd> aç</span>
          <span className="ml-auto"><kbd>Ctrl</kbd><kbd>K</kbd> hər yerdən</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
