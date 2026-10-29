import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { mileagePhotoUrl } from "@/services/myFuel/mileage";
import type { SignedPhotoProps } from "@/types/myFuel";

// Qapalı bucket-dəki spidometr şəkli (imzalı link); klik → böyük şəkil yeni tabda
export function SignedPhoto({ path, alt }: SignedPhotoProps) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    mileagePhotoUrl(path).then((u) => { if (!cancelled) setUrl(u); });
    return () => { cancelled = true; };
  }, [path]);
  const shown = path ? url : null;
  if (!path) return <span className="grid h-16 w-24 shrink-0 place-items-center rounded-lg bg-bg text-muted"><ImageIcon size={18} /></span>;
  return shown ? (
    <a href={shown} target="_blank" rel="noreferrer" className="shrink-0" title="Şəkli böyüt">
      {/* eslint-disable-next-line @next/next/no-img-element -- imzalı link, optimizasiyaya ehtiyac yoxdur */}
      <img src={shown} alt={alt} className="h-16 w-24 rounded-lg object-cover ring-1 ring-line" />
    </a>
  ) : <span className="h-16 w-24 shrink-0 animate-pulse rounded-lg bg-bg" />;
}
