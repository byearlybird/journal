import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import { appContract } from "@worker/contract";
import { atom } from "nanostores";

export type APIClient = ContractRouterClient<typeof appContract>;

export type APIStore =
  | {
      status: "authed";
      client: APIClient;
    }
  | {
      status: "unauthed";
      client: null;
    };

export const $api = atom<APIStore>({
  status: "unauthed",
  client: null,
});

let currentGetToken: (() => Promise<string | null>) | null = null;

export function setAuthed(getToken: () => Promise<string | null>) {
  currentGetToken = getToken;
  $api.set({ status: "authed", client: createAPIClient(getToken) });
}

export function setUnauthed() {
  currentGetToken = null;
  $api.set({ status: "unauthed", client: null });
}

export async function authedFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const getToken = currentGetToken;
  if (!getToken) throw new Error("Not authenticated");
  const token = await getToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

function createAPIClient(getToken: () => Promise<string | null>): APIClient {
  const link = new RPCLink({
    url: `${window.location.origin}/api`,
    headers: async () => {
      const token = await getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  });

  return createORPCClient(link);
}
