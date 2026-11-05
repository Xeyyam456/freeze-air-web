import s from "../../styles/Dashboard.module.css";

// Panel yüklənərkən yer tutucu: .dash sinfi ilə — fon və üst zolaq ilk görüntüdən tünd olur (açıq → tünd sıçrayışı yox)
export function DashFallback() {
  return <div className={`${s.dash} ${s.fallback}`} aria-busy="true" />;
}
