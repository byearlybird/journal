import * as Crypto from "@/crypto";
import { computed, type ReadableAtom } from "nanostores";
import { $dek, clearDEK, setDEK } from "./dek";
import {
  $api,
  type APIClient,
  setAuthed as setAPIAuthed,
  setUnauthed as setAPIUnauthed,
} from "./api";
import { syncService, type ChangeTransport } from "@/services/sync-service";
import { blobService } from "@/services/blob-service";

type SyncClientStore =
  | {
      status: "unauthed";
    }
  | {
      status: "loading-key";
      client: APIClient;
    }
  | {
      status: "locked";
      client: APIClient;
    }
  | {
      status: "unlocked";
      client: APIClient;
      dek: CryptoKey;
    };

export const $syncState: ReadableAtom<SyncClientStore> = computed([$api, $dek], (api, dek) => {
  if (api.status === "unauthed") {
    return { status: "unauthed" } as const;
  }

  switch (dek.status) {
    case "loading":
      return { status: "loading-key", client: api.client } as const;
    case "empty":
      return { status: "locked", client: api.client } as const;
    case "ready":
      return { status: "unlocked", client: api.client, dek: dek.dek } as const;
    default:
      throw new Error("Invalid state combination");
  }
});

export function setAuth(getToken: () => Promise<string | null>) {
  setAPIAuthed(getToken);
}

export async function setKey(dek: CryptoKey) {
  await setDEK(dek);
}

export async function clearAuth() {
  setAPIUnauthed();
  await clearDEK();
}

export async function createKey(
  password: string,
): Promise<{ result: "success" } | { result: "unauthed" } | { result: "error"; error: Error }> {
  const state = $syncState.get();

  if (state.status === "unauthed") {
    return { result: "unauthed" } as const;
  }

  try {
    const salt = Crypto.generateSalt();
    const kek = await Crypto.deriveKEK(password, salt);
    const { key: dek, raw } = await Crypto.generateRawDEK();
    const { wrappedKey, iv } = await Crypto.wrapDEK(raw, kek);

    await state.client.setWrappedKey({ wrappedKey, salt: Crypto.toBase64(salt), iv });
    await setDEK(dek);

    return { result: "success" } as const;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { result: "error", error: err } as const;
  }
}

export async function hasRemoteKey(): Promise<
  | { result: "success"; hasKey: boolean }
  | { result: "unauthed" }
  | { result: "error"; error: Error }
> {
  const state = $syncState.get();
  if (state.status === "unauthed") {
    return { result: "unauthed" } as const;
  }

  try {
    const hasKey = await state.client.getWrappedKey();
    return { result: "success", hasKey: hasKey !== null } as const;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { result: "error", error: err } as const;
  }
}

export async function loadRemoteKey(
  password: string,
): Promise<{ result: "success" } | { result: "unauthed" } | { result: "error"; error: Error }> {
  const state = $syncState.get();
  if (state.status === "unauthed") {
    return { result: "unauthed" } as const;
  }

  try {
    const wrappedKey = await state.client.getWrappedKey();
    if (!wrappedKey) {
      return { result: "error", error: new Error("No remote key found") } as const;
    }

    const salt = Crypto.fromBase64(wrappedKey.salt);
    const kek = await Crypto.deriveKEK(password, salt);
    const dek = await Crypto.unwrapDEK(wrappedKey.wrappedKey, wrappedKey.iv, kek);

    await setDEK(dek);

    return { result: "success" } as const;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { result: "error", error: err } as const;
  }
}

export async function lock(): Promise<void> {
  await clearDEK();
}

export async function sync(): Promise<
  { result: "success" } | { result: "not-unlocked" } | { result: "error"; error: Error }
> {
  const state = $syncState.get();
  if (state.status !== "unlocked") {
    return { result: "not-unlocked" } as const;
  }

  const transport: ChangeTransport = {
    pullChanges: (since) => state.client.pullChanges({ since }),
    pushChanges: (changes) => state.client.pushChanges({ changes }).then(() => undefined),
  };

  try {
    await syncService.pull(state.dek, transport);

    // Upload blobs before pushing the change rows that reference them, so other
    // devices never pull a row pointing at a blob that isn't in R2 yet. If any
    // upload fails, skip push entirely — the next sync will retry.
    try {
      await blobService.uploadPending(state.dek);
    } catch (error) {
      console.error("Blob upload failed; skipping push", error);
      return { result: "success" } as const;
    }

    await syncService.push(state.dek, transport);

    // Delete blobs after push so receivers see the nulled-out reference before
    // the underlying object disappears from R2.
    try {
      await blobService.deletePending();
    } catch (error) {
      console.error("Blob delete failed", error);
    }
    return { result: "success" } as const;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { result: "error", error: err } as const;
  }
}
