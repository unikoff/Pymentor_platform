import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const devApiTarget = "http://127.0.0.1:8001";

export default defineConfig({
  plugins: [react()],
  // VITE_BASE is public build-time configuration (for example /platform/).
  // Never put backend credentials or other secrets in VITE_* variables.
  base: process.env.VITE_BASE ?? "/",
  cacheDir: process.env.VITE_CACHE_DIR ?? "C:/Temp/pymentor-platform-vite-cache",
  server: {
    strictPort: true,
    proxy: {
      "/api": {
        target: devApiTarget,
        changeOrigin: true,
      },
    },
  },
});
