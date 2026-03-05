importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js",
);

// __SW_MANIFEST__ is replaced at build time by the generate script
workbox.precaching.precacheAndRoute(self.__SW_MANIFEST__ || []);

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());

// SPA: serve index.html for all navigation requests
const navHandler = workbox.precaching.createHandlerBoundToURL("/index.html");
workbox.routing.registerRoute(
  new workbox.routing.NavigationRoute(navHandler),
);

// API: network only (sync handles offline logic)
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith("/v0"),
  new workbox.strategies.NetworkOnly(),
);
