import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import typedCssModulesPlugin from "vite-plugin-typed-css-modules";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), cloudflare(), typedCssModulesPlugin()],
});
