// Şüşədəki bir su damcısı. run — süzülən (iri) və ya yerində duran (xırda); px/py — izin son nöqtəsi;
// stuck — ilişib qalma müddəti (kadr); sway — yana yırğalanma; a — görünürlük
export type Drop = { x: number; y: number; px: number; py: number; r: number; vy: number; run: boolean; wait: number; age: number; life: number; a: number; stuck: number; sway: number };
