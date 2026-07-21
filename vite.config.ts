import path from "node:path";

import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// Base URL of the platform API (Hono). In dev the Vite server proxies
// `/api/*` -> `${API_BASE_URL}/*` so the browser sees a same-origin cookie
// domain, matching how the Next.js app was wired up.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env.API_BASE_URL ?? "http://localhost:3001/v1";

  return {
    plugins: [
      // Must run before @vitejs/plugin-react.
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
      // Uploads source maps to Sentry on release builds. Silently no-ops
      // without `SENTRY_AUTH_TOKEN` set (e.g. local dev).
      sentryVitePlugin({
        org: "grid-sustain-solutions",
        project: "javascript-nextjs",
        authToken: env.SENTRY_AUTH_TOKEN,
        disable: !env.SENTRY_AUTH_TOKEN,
        telemetry: false,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      sourcemap: true,
    },
  };
});
