export const NAV_STORAGE_KEY = "panel-nav";

// Menyunu yığ/aç: vəziyyət <html data-nav="mini">-dədir (ilk boyamadan əvvəl root layout-dakı skript qoyur), localStorage-da saxlanır
export function toggleMini() {
  const html = document.documentElement;
  const mini = html.dataset.nav !== "mini";
  if (mini) html.dataset.nav = "mini";
  else delete html.dataset.nav;
  try {
    localStorage.setItem(NAV_STORAGE_KEY, mini ? "mini" : "full");
  } catch {}
}
