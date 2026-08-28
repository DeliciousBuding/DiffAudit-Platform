import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Vite config for the DiffAudit web SPA.
 *
 * The SPA is served same-origin by the Go gateway; dev proxies /api to the
 * gateway on 8780. Build-time env injection follows the DIFFAUDIT_* envs.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.DIFFAUDIT_DEV_API_TARGET ?? "http://127.0.0.1:8780",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
  },
  define: {
    "process.env.DIFFAUDIT_DEMO_MODE": JSON.stringify(process.env.DIFFAUDIT_DEMO_MODE ?? ""),
    "process.env.DIFFAUDIT_FORCE_DEMO_MODE": JSON.stringify(process.env.DIFFAUDIT_FORCE_DEMO_MODE ?? ""),
    "process.env.DIFFAUDIT_API_BASE_URL": JSON.stringify(
      process.env.DIFFAUDIT_API_BASE_URL ?? "",
    ),
    "process.env.DIFFAUDIT_PLATFORM_URL": JSON.stringify(
      process.env.DIFFAUDIT_PLATFORM_URL ?? "",
    ),
    "import.meta.env.VITE_DIFFAUDIT_TRIAL_FORM_URL": JSON.stringify(
      process.env.DIFFAUDIT_TRIAL_FORM_URL ?? "",
    ),
    "import.meta.env.VITE_DIFFAUDIT_DEMO_MODE": JSON.stringify(
      process.env.DIFFAUDIT_DEMO_MODE ?? "",
    ),
    "import.meta.env.VITE_GITHUB_CLIENT_ID": JSON.stringify(
      process.env.GITHUB_CLIENT_ID ?? "",
    ),
    "import.meta.env.VITE_GOOGLE_CLIENT_ID": JSON.stringify(
      process.env.GOOGLE_CLIENT_ID ?? "",
    ),
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
