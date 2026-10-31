import { Building2, CalendarOff, Plus, Store } from "lucide-react";
import { norm } from "@/shared/utils/norm";
import type { Found, PaletteItem } from "@/types/panel";
import { navGroups, PANEL_EVENTS } from "../../nav";
import type { MenuHandlers } from "@/types/panel";

const route = (kind: string) => (kind === "market" ? "/magazalar" : "/sirketler");

// Nəticə siyahısı: tez əməllər + səhifələr (söz-söz süzgəc) + bazadan tapılan şirkət / mağaza
export function buildItems(query: string, found: Found | null, showDepot: boolean, showFuel: boolean, { go, act }: MenuHandlers): PaletteItem[] {
  const words = norm(query).split(/\s+/).filter(Boolean);
  const match = (s: string) => words.every((w) => norm(s).includes(w));
  const actions: PaletteItem[] = [
    { key: "a:work", group: "Tez əməllər", label: "İş əlavə et", hint: "Görülən işi yaz", icon: Plus, run: act(PANEL_EVENTS.addWork) },
    { key: "a:leave", group: "Tez əməllər", label: "İcazə istə", hint: "İcazə sorğusu göndər", icon: CalendarOff, run: act(PANEL_EVENTS.leave) },
  ];
  const pages: PaletteItem[] = navGroups(showDepot, showFuel).flatMap((g) =>
    g.items.map((i) => ({ key: `p:${i.href}`, group: "Səhifələr", label: i.label, hint: i.hint, icon: i.icon, run: go(i.href) })));
  const local = [...actions, ...pages].filter((i) => match(`${i.label} ${i.hint ?? ""}`));
  if (query.trim().length < 2 || !found) return local;

  const companies: PaletteItem[] = found.companies.map((c) => ({
    key: `c:${c.id}`, group: "Şirkət və marketlər", label: c.name, hint: c.kind === "market" ? "Market" : "Şirkət",
    icon: c.kind === "market" ? Store : Building2, run: go(`${route(c.kind)}/${c.id}`),
  }));
  const stores: PaletteItem[] = found.stores.map((s) => ({
    key: `s:${s.id}`, group: "Mağaza və filiallar", label: [s.code, s.name].filter(Boolean).join(" · "),
    hint: [s.companies?.name, s.address].filter(Boolean).join(" — "), icon: Store,
    run: go(`${route(s.companies?.kind ?? "company")}/${s.company_id}?q=${encodeURIComponent(s.code || s.name)}`),
  }));
  return [...local, ...companies, ...stores];
}
