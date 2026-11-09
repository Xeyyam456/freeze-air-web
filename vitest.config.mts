import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

// Saf util-lərin unit testləri (Next lazım deyil). Alias tsconfig.json ilə eyni
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    // Testlər kompüterin saat qurşağından asılı olmasın: ustaların cihazı kimi Bakı
    env: { TZ: "Asia/Baku" },
  },
});
