"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/experience";
import { toast } from "@/lib/toast";
import { Modal } from "./Modal";

const BUCKET = "avatars";
const SIZE = 512;

// Şəkli ortadan kvadrat kəsib 512px WebP-yə çevirir (admin panelindəki ilə eyni)
async function toSquareWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(SIZE, side);
  canvas.getContext("2d")!.drawImage(
    bitmap,
    (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side,
    0, 0, canvas.width, canvas.height,
  );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Şəkil çevrilmədi."))), "image/webp", 0.85));
}

function storagePath(url: string | null) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  return url?.includes(marker) ? url.split(marker)[1] : null;
}

export type Me = { employeeId: number | null; name: string; role: string; email: string; photoUrl: string | null };

// Sol menyunun altındakı profil: klik → pəncərə. Əməkdaşa bağlı hesab öz şəklini burada qoyur/dəyişir/silir
// (baza yalnız öz şəklinə icazə verir: set_employee_photo).
export function ProfileButton({ me }: { me: Me }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} title={`${me.name} — profili aç`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5 text-left hover:bg-white/10">
        {me.photoUrl
          // eslint-disable-next-line @next/next/no-img-element -- storage şəkli
          ? <img src={me.photoUrl} alt="" className="avatar !h-9 !w-9 shrink-0 object-cover" />
          : <span className="avatar !h-9 !w-9 shrink-0">{initials(me.name)}</span>}
        <span className="nav-label min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold text-white">{me.name}</span>
          <span className="block truncate text-[11px] text-white/55">{me.role}</span>
        </span>
      </button>
      {open && <ProfileModal me={me} onClose={() => setOpen(false)} />}
    </>
  );
}

function ProfileModal({ me, onClose }: { me: Me; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(me.photoUrl);
  const [pending, setPending] = useState(false);

  async function save(url: string | null) {
    const supabase = createClient();
    const { error } = await supabase.rpc("set_employee_photo", { p_employee_id: me.employeeId!, p_url: url });
    if (error) throw error;
    const old = storagePath(photoUrl);
    if (old) await supabase.storage.from(BUCKET).remove([old]);
    setPhotoUrl(url);
    toast.success(url ? "Şəkil yadda saxlanıldı" : "Şəkil silindi");
    router.refresh();
  }

  async function onFile(file: File | undefined) {
    if (!file || !me.employeeId) return;
    if (!file.type.startsWith("image/")) return toast.error("Yalnız şəkil faylı seç.");
    setPending(true);
    try {
      const blob = await toSquareWebp(file);
      const path = `${me.employeeId}/${crypto.randomUUID()}.webp`;
      const supabase = createClient();
      const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp" });
      if (error) throw error;
      await save(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    } catch {
      toast.error("Şəkil yüklənmədi. Başqa şəkil yoxla.");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onRemove() {
    setPending(true);
    try {
      await save(null);
    } catch {
      toast.error("Şəkil silinmədi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal onClose={onClose} labelledBy="profile-title" className="!max-w-md">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="icon-tile !h-11 !w-11 shrink-0"><UserRound size={20} /></span>
          <div className="min-w-0">
            <h2 id="profile-title" className="text-lg font-bold">Profil</h2>
            <p className="muted truncate text-sm max-[400px]:text-[11px]" title={me.email}>{me.email}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="icon-btn" aria-label="Bağla"><X size={18} /></button>
      </div>

      {me.employeeId ? (
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
          <button type="button" onClick={() => inputRef.current?.click()} disabled={pending} className="btn btn-secondary btn-sm max-sm:flex-1">
            <ImagePlus size={14} /> {pending ? "..." : photoUrl ? "Dəyiş" : "Yüklə"}
          </button>
          {photoUrl && (
            <button type="button" onClick={onRemove} disabled={pending} className="icon-btn icon-btn-danger" title="Şəkli sil" aria-label="Şəkli sil">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ) : (
        <p className="muted text-sm">Bu hesab heç bir əməkdaşa bağlı deyil, ona görə profil şəkli yoxdur.</p>
      )}
      <p className="muted mt-4 text-xs">Ad, telefon və digər məlumatları rəhbərlik dəyişir.</p>
    </Modal>
  );
}
