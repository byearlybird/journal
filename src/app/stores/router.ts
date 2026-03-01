import { createRouter } from "@nanostores/router";

export const $router = createRouter({
  app: "/app",
  entries: "/app/entries",
  note: "/note/:id",
  task: "/task/:id",
  settings: "/settings",
});
