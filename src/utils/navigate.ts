import { openPage } from "@nanostores/router";
import { $router } from "@/stores/router";

type TransitionType = "slide-left" | "slide-right";

type RouteParams = {
  app: Record<string, never>;
  entries: Record<string, never>;
  note: { id: string };
  task: { id: string };
  settings: Record<string, never>;
};

export function navigate<R extends keyof RouteParams>(
  route: R,
  ...[params, options]: RouteParams[R] extends Record<string, never>
    ? [params?: undefined, options?: { search?: Record<string, string>; transition?: TransitionType }]
    : [params: RouteParams[R], options?: { search?: Record<string, string>; transition?: TransitionType }]
) {
  const transition = options?.transition;
  const search = options?.search;

  const go = () => {
    openPage($router, route, params as any);
    if (search) {
      const url = new URL(window.location.href);
      for (const [key, value] of Object.entries(search)) {
        url.searchParams.set(key, value);
      }
      history.replaceState(null, "", url.toString());
    }
  };

  if (transition && document.startViewTransition) {
    document.documentElement.dataset.transition = transition;
    const t = document.startViewTransition(go);
    t.finished.then(() => {
      delete document.documentElement.dataset.transition;
    });
  } else {
    go();
  }
}
