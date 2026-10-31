import { History, MapPin, Phone } from "lucide-react";
import { MapButton } from "../MapButton";
import { NavButton } from "../NavButton";
import { PlaceLocationButton } from "@/shared/components/PlaceLocationButton";
import type { StoreCardProps } from "@/types/shared";
import { Button } from "@/shared/components/Button";

export function StoreCard({ store, companyName, action, onHistory }: StoreCardProps) {
  const hasCoords = store.lat != null && store.lng != null;

  return (
    <div className="store-card flex flex-col">
      {/* Kod: kartın ən çox axtarılan məlumatı, ona görə ən gözə çarpan yer; sağda koordinat vəziyyəti */}
      <div className="flex items-center justify-between gap-3">
        <span className="store-code">{store.code}</span>
        {action ?? (
          <span className={`flex items-center gap-1.5 text-xs font-semibold ${hasCoords ? "text-ok" : "text-amber-600"}`}
            title={hasCoords ? "Koordinat var: xəritədə dəqiq yer" : "Koordinat yoxdur: xəritə ünvanla axtarır"}>
            <span className={`h-2 w-2 rounded-full ${hasCoords ? "bg-ok" : "bg-amber-500"}`} />
            {hasCoords ? "Koordinat var" : "Koordinat yoxdur"}
          </span>
        )}
      </div>

      <div className="mt-3 min-w-0 flex-1">
        {companyName && <p className="muted text-xs font-semibold">{companyName}</p>}
        <h3 className="line-clamp-2 text-[15px] font-bold">{store.name}</h3>
        <p className="muted mt-1 flex items-start gap-1.5 text-[13px]">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          <span className="line-clamp-1">{store.address ?? "Ünvan yazılmayıb"}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[13px]">
          <Phone size={14} className="muted shrink-0" />
          {store.phone
            ? <a href={`tel:${store.phone}`} className="link">{store.phone}</a>
            : <span className="muted">Telefon yoxdur</span>}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-dashed border-line pt-3 max-sm:[&>*]:flex-1 max-sm:[&>*]:justify-center">
        {/* Planşet/kompüterdə "Konumu düzəlt" eyni sətirdə solda; telefonda aşağıda tam endə (Naviqatorla) */}
        <PlaceLocationButton place={{ kind: "store", id: store.id, code: store.code, name: store.name, address: store.address, lat: store.lat, lng: store.lng }} className="btn btn-soft btn-sm mr-auto max-sm:!hidden" />
        {onHistory && (
          <Button type="button" onClick={onHistory} variant="soft" size="sm" title="Bu yerdə görülən işlər">
            <History size={14} /> Tarixçə
          </Button>
        )}
        <MapButton place={store} />
      </div>
      {/* Yalnız telefonda: konumu düzəlt + Waze / Google Maps seçimi ilə ünvana getmək */}
      <div className="mt-2 flex flex-wrap gap-2 sm:hidden [&>*]:flex-1">
        <PlaceLocationButton place={{ kind: "store", id: store.id, code: store.code, name: store.name, address: store.address, lat: store.lat, lng: store.lng }} className="btn btn-soft btn-sm max-sm:w-full max-sm:justify-center" />
        <div className="sm:hidden"><NavButton place={store} /></div>
      </div>
    </div>
  );
}
