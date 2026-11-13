import { defineConfig, mergeConfig } from "vite";
import base from "./vite.config";

// Temporary local-only verification; no production configuration or secrets.
export default mergeConfig(base, defineConfig({
  server: { proxy: { "/api": { target: "http://127.0.0.1:8012", changeOrigin: false } } },
}));
