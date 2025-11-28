import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		tanstackRouter({
			target: "react",
		}),
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",

			manifest: {
				name: "Journal by Early Bird",
				short_name: "Journal",
				description: "A local-first, privacy-focused journaling app",
				theme_color: "#000000",
				background_color: "#000000",
				display: "standalone",
				start_url: "/",
				orientation: "portrait-primary",
				categories: ["productivity"],
				icons: [
					{
						src: "manifest-icon-192.maskable.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable any",
					},
					{
						src: "manifest-icon-512.maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable any",
					},
					{
						src: "favicon-196.png",
						sizes: "196x196",
						type: "image/png",
						purpose: "any",
					},
				],
			},

			workbox: {
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true,
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],

				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "google-fonts-cache",
							expiration: {
								maxEntries: 30,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
						},
					},
				],
			},

			devOptions: {
				enabled: true,
			},
		}),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
});
