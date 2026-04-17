import { atom } from "nanostores";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

export type APIClient = ReturnType<typeof createAPIClient>;

export type APIStore = {
  isSignedIn: boolean;
  client: APIClient;
};

function createAPIClient(getToken: () => Promise<string | null>) {
  const link = new RPCLink({
    url: "http://localhost:5173/api",
    headers: async () => {
      const token = await getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  });
  return createORPCClient(link);
}

export const $apiStore = atom<APIStore>({
  isSignedIn: false,
  client: createAPIClient(() => Promise.resolve(null)),
});

export function setSignedIn(isSignedIn: boolean) {
  $apiStore.set({ ...$apiStore.get(), isSignedIn });
}

export function setTokenGetter(getToken: () => Promise<string | null>) {
  $apiStore.set({ ...$apiStore.get(), client: createAPIClient(getToken) });
}
