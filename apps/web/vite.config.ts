import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Vite config for the DiffAudit web SPA.
 *
 * Next shims are aliased to local modules so legacy page modules that still
 * import from `next/*` compile unchanged during the migration. Each shim must
 * disappear once the corresponding module is fully migrated (track in
 * `.agents/planning/progress/MASTER.md`, task A3).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "next/link": path.resolve(__dirname, "./src/lib/next-shims/link.tsx"),
      "next/navigation": path.resolve(__dirname, "./src/lib/next-shims/navigation.ts"),
      "next/headers": path.resolve(__dirname, "./src/lib/next-shims/headers.ts"),
      "next/font/google": path.resolve(__dirname, "./src/lib/next-shims/font.ts"),
      "next/font/local": path.resolve(__dirname, "./src/lib/next-shims/font.ts"),
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
