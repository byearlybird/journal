import index from "./index.html";
import { api } from "./api/index.ts";

const server = Bun.serve({
  routes: {
    "/api/*": (req) => api.fetch(req),
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
