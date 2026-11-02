// Usta paneli PWA manifesti: telefonda "Ana ekrana əlavə et" → tətbiq kimi tam ekran açılır (ünvan zolağı yoxdur).
// Yalnız panel layout-u bu manifesti göstərir: açıq saytın qonaqlarına quraşdırma təklifi çıxmır.
const manifest = {
  name: "Freeze Air — Usta paneli",
  short_name: "Freeze Air",
  description: "Tapşırıqlar, iş qeydləri, davamiyyət, alətlər",
  id: "/panel",
  start_url: "/panel",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  lang: "az",
  background_color: "#f4f6fa",
  theme_color: "#06192b",
  icons: [
    { src: "/app-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/app-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/app-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

export function GET() {
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
