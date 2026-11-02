import { ImageResponse } from "next/og";
import type { AppIconRouteContext } from "@/types/panel";

// Usta paneli PWA ikonu (ana ekran, Android, iOS): menyudakı loqo — göy gradient üzərində qar dənəsi (lucide Snowflake).
// Build-də statik PNG kimi yaradılır. "maskable" üçün qar dənəsi kənarlardan ~20% içəridədir (təhlükəsiz zona).
const SIZES = ["180", "192", "512"];
const PATHS = [
  "m10 20-1.25-2.5L6 18", "M10 4 8.75 6.5 6 6", "m14 20 1.25-2.5L18 18", "m14 4 1.25 2.5L18 6",
  "m17 21-3-6h-4", "m17 3-3 6 1.5 3", "M2 12h6.5L10 9", "m20 10-1.5 2 1.5 2",
  "M22 12h-6.5L14 15", "m4 10 1.5 2L4 14", "m7 21 3-6-1.5-3", "m7 3 3 6h4",
];

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }));
}

export async function GET(_req: Request, { params }: AppIconRouteContext) {
  const { size: raw } = await params;
  const size = SIZES.includes(raw) ? Number(raw) : 192;
  const glyph = Math.round(size * 0.5);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #22c3e6, #1f6feb)" }}>
        <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {PATHS.map((d) => <path key={d} d={d} />)}
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
