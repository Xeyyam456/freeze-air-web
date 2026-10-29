import type { DraftNoticeProps } from "@/types/myWork";

// Yarımçıq qaralama bərpa olunanda bildiriş və "Qaralamanı sil"
export function DraftNotice({ onDiscard }: DraftNoticeProps) {
  return (
    <p className="flex items-center justify-between gap-3 rounded-xl bg-primary-soft px-3 py-2 text-xs font-semibold text-primary">
      Yarımçıq qalan iş bərpa olundu (şəkillər saxlanmır).
      <button type="button" className="underline" onClick={onDiscard}>Qaralamanı sil</button>
    </p>
  );
}
