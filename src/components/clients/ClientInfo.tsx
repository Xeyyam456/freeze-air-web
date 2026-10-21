import { MapPin, Phone, User } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { asKind, KIND } from "@/lib/kinds";
import { PlaceHistoryButton } from "@/components/work/PlaceHistory";

// Sağ panel: şirkətin/marketin vizit kartı (yalnız baxış)
export function ClientInfoCard({ company, unitCount }: { company: Tables<"companies">; unitCount: number }) {
  const kind = asKind(company.kind);
  const k = KIND[kind];

  return (
    <div className="card">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-frost to-primary text-xl font-extrabold text-white shadow-[0_6px_16px_rgba(31,111,235,0.3)]">
          {company.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold">{company.name}</h2>
          <p className="muted text-xs font-medium">
            {k.One} · {kind === "company" && unitCount === 0 ? "sabit məkan" : `${unitCount} ${k.unit}`}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="min-w-0 rounded-xl bg-bg px-3 py-2">
          <p className="muted flex items-center gap-1.5 text-xs font-medium"><User size={13} /> Əlaqəli şəxs</p>
          <p className="truncate font-semibold">{company.contact_person ?? "—"}</p>
        </div>
        <div className="min-w-0 rounded-xl bg-bg px-3 py-2">
          <p className="muted flex items-center gap-1.5 text-xs font-medium"><Phone size={13} /> Telefon</p>
          {company.phone
            ? <a href={`tel:${company.phone}`} className="link block truncate">{company.phone}</a>
            : <p className="font-semibold">—</p>}
        </div>
      </div>
      {kind === "company" && (
        <div className="mt-2 min-w-0 rounded-xl bg-bg px-3 py-2 text-sm">
          <p className="muted flex items-center gap-1.5 text-xs font-medium"><MapPin size={13} /> Ünvan</p>
          <p className="truncate font-semibold">{company.address ?? "—"}</p>
        </div>
      )}
      {company.notes && <p className="muted mt-3 line-clamp-2 text-sm">{company.notes}</p>}
      {/* Bütün obyektin (özü + filialları/mağazaları) iş tarixçəsi */}
      <PlaceHistoryButton target={{ title: company.name, companyId: company.id }} className="btn btn-soft mt-4 w-full" />
    </div>
  );
}
