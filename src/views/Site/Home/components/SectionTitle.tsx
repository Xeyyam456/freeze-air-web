import type { SectionTitleProps } from "@/types/site";

export function SectionTitle({ title, lead, light = false }: SectionTitleProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className={`mx-auto block h-1 w-12 rounded-full ${light ? "bg-white" : "bg-cold"}`} aria-hidden="true" />
      <h2 className={`mt-4 text-balance font-display text-[clamp(1.4rem,6.9vw,1.875rem)] font-bold sm:text-4xl ${light ? "text-white" : ""}`}>{title}</h2>
      {lead && <p className={`mt-3 ${light ? "text-white/75" : "text-night/60"}`}>{lead}</p>}
    </div>
  );
}
