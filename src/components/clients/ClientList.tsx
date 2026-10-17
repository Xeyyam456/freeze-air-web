import Link from "next/link";
import { Building2, ChevronRight, Phone, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { KIND, type Kind } from "@/lib/kinds";

// Kartdakı alt yazı: filial sayı, filialı olmayan şirkətdə isə ünvanı
function unitLabel(kind: Kind, count: number, address: string | null) {
  if (kind === "company" && count === 0) return address ?? "Sabit məkan, ünvan yazılmayıb";
  return `${count} ${KIND[kind].unit}`;
}

// Şirkətlərin və ya market şəbəkələrinin kart siyahısı
export async function ClientList({ kind, emptyHint }: { kind: Kind; emptyHint: string }) {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("companies")
    .select("id, name, phone, address, stores(count)")
    .eq("kind", kind)
    .order("name");

  const k = KIND[kind];
  const Icon = kind === "market" ? Store : Building2;

  if (!clients?.length) {
    return (
      <div className="card py-12 text-center">
        <span className="icon-tile mx-auto"><Icon size={20} /></span>
        <p className="mt-3 font-semibold">Hələ {k.one} yoxdur</p>
        <p className="muted text-sm">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {clients.map((c) => (
        <Link key={c.id} href={`${k.route}/${c.id}`} className="card card-link flex items-center gap-4">
          <span className="icon-tile text-lg font-extrabold">{c.name.charAt(0)}</span>
          <div className="min-w-0 flex-1">
            <h3 className="card-title truncate">{c.name}</h3>
            <p className="muted flex items-center gap-3 text-sm">
              <span className="truncate">{unitLabel(kind, c.stores[0]?.count ?? 0, c.address)}</span>
              {c.phone && <span className="flex items-center gap-1"><Phone size={13} />{c.phone}</span>}
            </p>
          </div>
          <ChevronRight size={18} className="muted" />
        </Link>
      ))}
    </div>
  );
}
