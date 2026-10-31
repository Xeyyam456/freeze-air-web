import { ImagePlus, Trash2 } from "lucide-react";
import { initials } from "@/lib/experience";
import type { ProfileButtonProps } from "@/types/profile";
import { useProfilePhoto } from "../../hooks/useProfilePhoto";
import { Button } from "@/shared/components/Button";

// Şəkil sətri: önizləmə, "Yüklə / Dəyiş", sil
export function ProfilePhotoRow({ me }: ProfileButtonProps) {
  const { inputRef, photoUrl, pending, onFile, onRemove } = useProfilePhoto(me);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line p-3 max-sm:gap-3">
      {photoUrl
        // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
        ? <img src={photoUrl} alt={me.name} className={`emp-avatar !h-16 !w-16 object-cover ${pending ? "opacity-50" : ""}`} />
        : <span className={`emp-avatar !h-16 !w-16 !text-lg ${pending ? "opacity-50" : ""}`}>{initials(me.name)}</span>}
      <div className="min-w-0 flex-[1_1_140px]">
        <p className="text-sm font-semibold">{me.name}</p>
        <p className="muted text-xs">Şəkil: JPG, PNG və ya WebP. Kvadrat kəsilir.</p>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])} />
      <Button type="button" onClick={() => inputRef.current?.click()} disabled={pending} variant="secondary" size="sm" className="max-sm:flex-1">
        <ImagePlus size={14} /> {pending ? "..." : photoUrl ? "Dəyiş" : "Yüklə"}
      </Button>
      {photoUrl && (
        <button type="button" onClick={onRemove} disabled={pending} className="icon-btn icon-btn-danger" title="Şəkli sil" aria-label="Şəkli sil">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
