import s from "./BrandDrip.module.css";

// Loqo adının ucunda su damcısı: yavaş-yavaş yığılır, ağırlaşıb uzanır, düşür (yalnız CSS).
// Ata element `relative inline-block` olmalıdır (damcı mətnin alt kənarına bağlanır).
export function BrandDrip() {
  return (
    <>
      <span aria-hidden="true" className={s.drop} />
      <span aria-hidden="true" className={`${s.drop} ${s.small}`} />
    </>
  );
}
