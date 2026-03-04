import path from "node:path";
import { fileURLToPath } from "node:url";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import sqlocal from "sqlocal/vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [tanstackRouter(), react(), tailwindcss(), sqlocal()],
  resolve: {
    alias: {
      "@app": path.resolve(dirname, "./src"),
    },
  },
  build: {
    target: "safari15",
  },
  server: {
    port: Number(process.env.LOCAL_PORT) || 5173,
  },
});
