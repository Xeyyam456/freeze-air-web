import type { MyTask } from "@/types/myTasks";

// Yer: mağaza/filial (şirkət adı ilə) | sabit məkanlı şirkət | siyahıda olmayan yer | silinib
export function placeOf(t: MyTask) {
  if (t.stores) return `${t.stores.companies?.name ?? ""} · ${t.stores.code} ${t.stores.name}`;
  if (t.companies) return t.companies.name;
  return t.place_text ?? "Yer silinib";
}
export const fileTotal = (t: MyTask) => t.files.act + t.files.photo + t.files.video;
