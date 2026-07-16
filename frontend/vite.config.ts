import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
