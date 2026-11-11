// Şüşədəki bir su damcısı. run — süzülən (böyüyüb ağırlaşan) və ya yerində duran; r — cari ölçü, rt — hədəf ölçü
// (süzülən damcı xırda yaranır, su yığıb böyüyür); px/py — izin son nöqtəsi; stuck — ilişib qalma müddəti (kadr);
// sway — yana yırğalanma; a — görünürlük
export type Drop = { x: number; y: number; px: number; py: number; r: number; rt: number; vy: number; run: boolean; wait: number; age: number; life: number; a: number; stuck: number; sway: number };
