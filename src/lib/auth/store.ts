import { Store } from "@tanstack/react-store";
import { get, set } from "idb-keyval";

export type User = { id: string; email: string };

export type AuthState = {
	loaded: boolean;
	user: User | null;
	masterKey: CryptoKey | null;
	vaultKey: CryptoKey | null;
	accessToken: string | null;
	refreshToken: string | null;
};

const PERSISTED_KEYS = [
	"user",
	"masterKey",
	"vaultKey",
	"accessToken",
	"refreshToken",
] as const;

export const authStore = new Store<AuthState>({
	loaded: false,
	user: null,
	masterKey: null,
	vaultKey: null,
	accessToken: null,
	refreshToken: null,
});

authStore.subscribe(({ prevVal, currentVal }) => {
	if (!currentVal.loaded) return;
	for (const key of PERSISTED_KEYS) {
		if (prevVal[key] !== currentVal[key]) {
			set(key, currentVal[key]);
		}
	}
});

export async function loadAuth() {
	const values = await Promise.all(PERSISTED_KEYS.map((k) => get(k)));
	const loaded = Object.fromEntries(
		PERSISTED_KEYS.map((k, i) => [k, values[i] ?? null]),
	);
	authStore.setState((s) => ({ ...s, ...loaded, loaded: true }));
}
