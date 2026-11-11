import type { EdgeFadeProps } from "@/types/site";
import s from "./EdgeFade.module.css";

// Tünd bölmənin kənarında qonşu açıq bölmənin rənginə hamar keçid: sərt xətt yoxdur, bölmələr bir-birinə axır.
// Ata bölmə `relative` olmalıdır; məzmun bu qatın üstündədir (yalnız CSS, JS yoxdur).
export function EdgeFade({ top, bottom }: EdgeFadeProps) {
  return (
    <>
      {top && <span aria-hidden="true" className={`${s.fade} ${s.top}`} style={{ "--c": top } as React.CSSProperties} />}
      {bottom && <span aria-hidden="true" className={`${s.fade} ${s.bottom}`} style={{ "--c": bottom } as React.CSSProperties} />}
    </>
  );
}
