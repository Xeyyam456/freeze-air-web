import { Check } from "lucide-react";
import type { PlaceSectionProps } from "@/types/clients";
import { Button } from "@/shared/components/Button";
import { Textarea } from "@/shared/components/Textarea";

// 1) Ünvan: yerdə olmasan da dəyişmək olar
export function AddressSection({ loc }: PlaceSectionProps) {
  return (
    <section>
      <span className="label">Dəqiq ünvan</span>
      <Textarea value={loc.address} onChange={(e) => loc.setAddress(e.target.value)} rows={2} maxLength={300} className="resize-none" placeholder="Məs. Bakı, Nəsimi r., Neftçilər pr. 120" />
      <p className="muted mt-1 text-xs">Mağazada olmasan belə, düzgün ünvanı bilirsənsə yaza bilərsən.</p>
      <Button type="button" disabled={!loc.addrChanged || loc.busy !== null} onClick={() => loc.save("addr")} variant="secondary" size="sm" className="mt-2 w-full">
        <Check size={14} /> {loc.busy === "addr" ? "..." : "Ünvanı yadda saxla"}
      </Button>
    </section>
  );
}
