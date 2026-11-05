"use client";

import { useEffect } from "react";

// Panel açıq olanda səhifənin fonu tünd: body-yə data-dash atributu. CSS-in body:has(.dash) yolu işləmir —
// Next 16 əvvəlki səhifəni DOM-da gizli saxlayır (React Activity) və başqa səhifədə də fon tünd qalırdı.
// Səhifə gizlənəndə effekt təmizlənir, atribut silinir.
export function useDarkBody() {
  useEffect(() => {
    document.body.dataset.dash = "";
    return () => { delete document.body.dataset.dash; };
  }, []);
}
