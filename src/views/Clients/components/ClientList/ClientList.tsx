import { fetchClientList } from "@/services/clients/fetchClientList.server";
import type { ClientListProps } from "@/types/clients";
import { clientRows } from "../../utils/clientRows";
import { ClientCard } from "./ClientCard";
import { ClientSummary } from "./ClientSummary";
import { EmptyClients } from "./EmptyClients";

// Şirkətlərin və ya market şəbəkələrinin siyahısı: üstdə tünd xülasə, altında iri kartlar (filial/mağaza sayı, bu ayın işləri)
export async function ClientList({ kind, emptyHint }: ClientListProps) {
  const raw = await fetchClientList(kind);
  if (!raw.clients.length) return <EmptyClients kind={kind} hint={emptyHint} />;

  const { rows, totals } = clientRows(raw);

  return (
    <div className="space-y-6">
      <ClientSummary kind={kind} count={rows.length} totals={totals} />
      <div className="flex flex-wrap gap-4">
        {rows.map((c) => <ClientCard key={c.id} client={c} kind={kind} />)}
      </div>
    </div>
  );
}
