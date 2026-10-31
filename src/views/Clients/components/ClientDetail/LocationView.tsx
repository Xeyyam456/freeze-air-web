import { MapPin, Navigation2 } from "lucide-react";
import { mapEmbedUrl, wazeUrl } from "@/lib/navigation";
import { PlaceLocationButton } from "@/shared/components/PlaceLocationButton";
import type { LocationViewProps } from "@/types/clients";
import { Card } from "@/shared/components/Card";

// Filialı olmayan (sabit məkanlı) şirkət: siyahı əvəzinə yeri böyük xəritədə
export function LocationView({ company }: LocationViewProps) {
  const hasLocation = (company.lat != null && company.lng != null) || !!company.address;

  if (!hasLocation) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <span className="icon-tile"><MapPin size={20} /></span>
        <p className="mt-3 font-semibold">Ünvan yazılmayıb</p>
        <p className="muted text-sm">Bu şirkətin ünvanı hələ daxil edilməyib.</p>
      </Card>
    );
  }

  return (
    <div className="relative h-[clamp(320px,calc(100vh-var(--topbar-h)-200px),720px)] overflow-hidden rounded-[18px] border border-line bg-surface p-2">
      <iframe
        src={mapEmbedUrl(company)}
        title={`${company.name} xəritədə`}
        className="block h-full w-full rounded-xl"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {/* Ünvan/koordinat səhvdirsə usta düzəldir (0087) */}
      <div className="absolute right-4 top-4 max-sm:right-3 max-sm:top-3">
        <PlaceLocationButton place={{ kind: "company", id: company.id, name: company.name, address: company.address, lat: company.lat, lng: company.lng }}
          className="btn btn-sm bg-white text-ink shadow-[0_6px_18px_rgba(6,25,43,0.25)] hover:bg-bg" />
      </div>
      {/* Yalnız telefonda (< 640): Waze ilə ünvana naviqasiya */}
      <a href={wazeUrl(company)} target="_blank" rel="noopener noreferrer"
        className="absolute bottom-5 left-1/2 inline-flex h-10 -translate-x-1/2 items-center gap-2 rounded-full bg-[#33ccff] px-5 text-sm font-bold text-[#06192b] shadow-[0_10px_24px_rgba(6,25,43,0.3)] sm:hidden">
        <Navigation2 size={16} /> Waze ilə get
      </a>
    </div>
  );
}
