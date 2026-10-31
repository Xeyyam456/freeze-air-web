import Link from "next/link";
import { getServices } from "@/lib/site-content";

// Footer-dəki xidmət keçidləri (bazadan, bütün aktiv xidmətlər)
export async function FooterServices() {
  const services = await getServices();
  return services.map((s) => (
    <li key={s.id}><Link href={`/xidmet/${s.slug}`} className="text-white/65 transition-colors hover:text-cold">{s.title}</Link></li>
  ));
}
