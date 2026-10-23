import { BarChart3, Building2, CalendarCheck, CalendarOff, Fuel, LayoutGrid, ListChecks, Package, Store, TriangleAlert, UserCog, Users, Warehouse, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; hint: string; tasks?: boolean; depot?: boolean; fuel?: boolean };

// Usta panelinin menyusu: qruplar sol menyuda və Ctrl+K axtarışında eyni sırada.
// Depo yalnız depo məsulu (və adminlər) üçündür: showDepot serverdə can_manage_tools() ilə təyin olunur.
export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Gündəlik",
    items: [
      { href: "/panel", label: "Panel", icon: LayoutGrid, hint: "Mənim bugünüm, görülən işlər, depo" },
      { href: "/tapshiriqlar", label: "Tapşırıqlar", icon: ListChecks, hint: "Günün tapşırıqları", tasks: true },
      { href: "/davamiyyet", label: "Davamiyyət", icon: CalendarCheck, hint: "İşə gəlmə, icazələr, təqvim" },
      { href: "/icazelerim", label: "İcazələrim", icon: CalendarOff, hint: "İcazə istə, sorğular və tarixçə" },
      { href: "/aletlerim", label: "Alətlərim", icon: Package, hint: "Üzərimdəkilər: Aldım, qaytar, alət istə" },
      { href: "/yanacaq", label: "Yanacaq", icon: Fuel, hint: "Gündəlik km və yanacaq pulu", fuel: true },
      { href: "/statistika", label: "Statistika", icon: BarChart3, hint: "Ay ərzində gördüyün işlər" },
    ],
  },
  {
    title: "Məlumat",
    items: [
      { href: "/sirketler", label: "Şirkətlər", icon: Building2, hint: "Şirkətlər və filialları" },
      { href: "/magazalar", label: "Mağazalar", icon: Store, hint: "Marketlər və mağazaları" },
      { href: "/xeta-kodlari", label: "Xəta kodları", icon: TriangleAlert, hint: "Model üzrə xəta kodları" },
    ],
  },
  {
    title: "Komanda",
    items: [
      { href: "/ustalar", label: "Ustalar", icon: Users, hint: "Ustalar və gördükləri işlər" },
      { href: "/rehberlik", label: "Rəhbərlik", icon: UserCog, hint: "Müdir və rəhbərlər" },
      { href: "/depo", label: "Depo", icon: Warehouse, hint: "Alətlər və materiallar", depot: true },
    ],
  },
];

// showFuel: yalnız maşını olan usta (employees.has_car, 0076-0077)
export function navGroups(showDepot: boolean, showFuel = false) {
  return NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => (!i.depot || showDepot) && (!i.fuel || showFuel)) }));
}

export function isActive(href: string, pathname: string | null) {
  return !!pathname && pathname.startsWith(href);
}

// Panel daxilində qlobal hadisələr: üst zolaq, Ctrl+K və "Mənim bugünüm" eyni pəncərələri açır
export const PANEL_EVENTS = {
  addWork: "panel:add-work",
  leave: "panel:leave",
  search: "panel:search",
  menu: "panel:menu",
} as const;

export function emitPanel(name: (typeof PANEL_EVENTS)[keyof typeof PANEL_EVENTS]) {
  window.dispatchEvent(new Event(name));
}
