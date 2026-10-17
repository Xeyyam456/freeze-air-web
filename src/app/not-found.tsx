import Link from "next/link";
import { ArrowLeft, Home, Snowflake } from "lucide-react";

export const metadata = { title: "Səhifə tapılmadı — Freeze Air Service" };

// 404: tünd gecə-mavisi fon, iri "404" və qar dənəsi; yalnız statik məzmun (data oxumur)
export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[linear-gradient(135deg,#091428,#0f2447_60%,#123a6a)] px-5 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-frost/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-md text-center">
        <div className="relative mx-auto w-fit">
          <span className="block bg-gradient-to-b from-white to-frost/60 bg-clip-text text-[9rem] font-extrabold leading-none tracking-tight text-transparent sm:text-[11rem]">404</span>
          <Snowflake size={56} className="absolute -right-4 -top-2 text-frost" aria-hidden="true" />
        </div>
        <h1 className="mt-2 text-2xl font-bold">Səhifə tapılmadı</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Axtardığın ünvan mövcud deyil, köçürülüb və ya silinib. Ünvanı yoxla və ya ana səhifəyə qayıt.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f2447] transition-transform hover:-translate-y-0.5">
            <Home size={16} /> Ana səhifə
          </Link>
          <Link href="/panel" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20">
            <ArrowLeft size={16} /> Usta paneli
          </Link>
        </div>
      </div>
    </main>
  );
}
