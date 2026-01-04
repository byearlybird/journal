import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), cloudflare(), tailwindcss()],
	resolve: {
		alias: {
			"@lib": path.resolve(__dirname, "./lib"),
			"@app": path.resolve(__dirname, "./app"),
			"@worker": path.resolve(__dirname, "./worker"),
		},
	},
});
