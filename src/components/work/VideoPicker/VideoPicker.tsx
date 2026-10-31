"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { toast } from "@/lib/toast";
import { compressVideo, formatBytes, formatSeconds, VideoError } from "@/lib/video";
import type { CompressedVideo } from "@/types/shared";

// İş videosu (0089): seçilən kimi telefonda 720p-yə sıxılır (lib/video.ts), müddət limiti yoxdur.
// İş formasında (WorkLogForm) və tapşırığın təmir qeydində (TaskNoteModal). Sıxılma gedərkən onBusy(true): forma göndərilməsin.
export function VideoPicker({ value, onChange, onBusy, className = "" }: {
  value: CompressedVideo | null;
  onChange: (v: CompressedVideo | null) => void;
  onBusy: (busy: boolean) => void;
  className?: string;
}) {
  const [progress, setProgress] = useState<number | null>(null);

  async function pick(file: File | null) {
    if (!file) return;
    onChange(null);
    setProgress(0);
    onBusy(true);
    try {
      onChange(await compressVideo(file, setProgress));
    } catch (err) {
      toast.error(err instanceof VideoError ? err.message : "Video sıxılmadı. Başqa video seç.");
    } finally {
      setProgress(null);
      onBusy(false);
    }
  }

  return (
    <label className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-3 py-3 text-center ${
      value ? "border-primary" : "border-line hover:border-primary"} ${progress !== null ? "pointer-events-none" : ""} ${className}`}>
      <Video size={18} className="text-primary" />
      <span className="text-sm font-semibold">Video</span>
      <span className="muted w-full truncate text-xs">
        {progress !== null ? `Hazırlanır… ${Math.round(progress * 100)}%`
          : value ? `${formatSeconds(value.seconds)} · ${formatBytes(value.bytes)}` : "720p-yə sıxılır"}
      </span>
      {progress !== null && (
        <span className="h-1 w-full overflow-hidden rounded-full bg-line">
          <span className="block h-full bg-primary transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
        </span>
      )}
      <input type="file" accept="video/*" className="sr-only" disabled={progress !== null}
        onChange={(e) => { pick(e.target.files?.[0] ?? null); e.target.value = ""; }} />
    </label>
  );
}

// Sıxılmış videonun xülasəsi: "125 MB → 27 MB (720×1280)" + Sil
export function VideoSummary({ value, onRemove }: { value: CompressedVideo | null; onRemove: () => void }) {
  if (!value) return null;
  return (
    <p className="-mt-2 flex items-center justify-between gap-2 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
      <span>Video sıxıldı: {formatBytes(value.originalBytes)} → {formatBytes(value.bytes)} ({value.width}×{value.height})</span>
      <button type="button" onClick={onRemove} className="shrink-0 underline">Sil</button>
    </p>
  );
}
