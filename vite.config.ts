import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [tanstackRouter(), react(), cloudflare(), tailwindcss()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "./src"),
      "@worker": path.resolve(__dirname, "./worker"),
    },
  },
});
