import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // На проде платформа живёт под префиксом /platform внутри сайта лендинга
  // (хостинг разрешает только один сайт), поэтому ассеты и API должны
  // резолвиться от него. Собираем прод как: VITE_BASE=/platform/ npm run build
  // В dev база остаётся "/" — фронт крутит Vite отдельно.
  base: process.env.VITE_BASE ?? "/",
  cacheDir: process.env.VITE_CACHE_DIR ?? "C:/Temp/pymentor-platform-vite-cache",
  server: {
    proxy: {
      "/user": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
      "/learning": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
      "/admin": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
    },
  },
});
