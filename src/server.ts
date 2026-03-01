import index from "./index.html";

const server = Bun.serve({
  routes: {
    "/api/status": {
      GET() {
        return Response.json({ status: "ok" });
      },
    },
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
