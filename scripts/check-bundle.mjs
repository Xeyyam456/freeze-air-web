// Bundle ölçüsü qoruyucusu (postbuild): limit keçilsə build uğursuz olur → Vercel deploy etmir, canlıda köhnə versiya qalır.
// Ölçülən: landing (/) və usta paneli (/panel) açılanda yüklənən JS (prerender HTML-dəki <script src>), gzip ilə.
// Səbəb (2026-11-02 performans işi): ağır client kitabxanası (xəritə, video, excel) səhifəyə birbaşa düşsə bu tutur.
// Limiti qaldırmaq lazımdırsa: əvvəl səbəbə bax, əsaslıdırsa LIMITS-i yenilə.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const LIMITS = {
  "/": 215, // 2026-11-02: 188 KB (react-dom, Next, landing animasiyaları)
  "/panel": 340, // 2026-11-02: 295 KB (+ supabase/realtime ~100 KB, panel çərçivəsi)
};
const PAGES = { "/": "index.html", "/panel": "panel.html" };

const next = path.resolve(".next");
const gz = (file) => zlib.gzipSync(fs.readFileSync(file)).length / 1024;

let failed = false;
for (const [route, file] of Object.entries(PAGES)) {
  const htmlFile = path.join(next, "server", "app", file);
  if (!fs.existsSync(htmlFile)) {
    console.log(`? ${route}: prerender HTML tapılmadı (${file}), yoxlanmadı`);
    continue;
  }
  const html = fs.readFileSync(htmlFile, "utf8");
  const scripts = [...new Set([...html.matchAll(/src="\/_next\/(static\/[^"]+\.js)"/g)].map((m) => m[1]))];
  const kb = scripts.reduce((sum, s) => sum + gz(path.join(next, s)), 0);
  const ok = kb <= LIMITS[route];
  if (!ok) failed = true;
  console.log(`${ok ? "✓" : "✗"} ${route}: ${scripts.length} JS, ${kb.toFixed(1)} KB gzip / limit ${LIMITS[route]} KB`);
}
if (failed) {
  console.error("Bundle limiti keçildi: client komponentə düşən ağır import axtar (scripts/check-bundle.mjs).");
  process.exit(1);
}
