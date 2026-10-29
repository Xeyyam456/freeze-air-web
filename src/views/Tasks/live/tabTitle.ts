// Tab arxa planda olanda başlıqda "(N)" göstərilir, tab açılanda silinir (səs olmasa da tab-da görünsün)
let unseen = 0;
let baseTitle = "";
export function markTitle() {
  if (!document.hidden) return;
  baseTitle ||= document.title;
  unseen += 1;
  document.title = `(${unseen}) Yeni tapşırıq · ${baseTitle}`;
}
export function clearTitle() {
  if (document.hidden || !unseen) return;
  unseen = 0;
  document.title = baseTitle;
  baseTitle = "";
}
