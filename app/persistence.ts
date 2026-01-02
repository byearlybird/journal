import type { StoreSnapshot } from "@byearlybird/starling";
import * as idb from "idb-keyval";

// Keys
const PREFIX = "journal";
export const CRYPTO_KEY_KEY = `${PREFIX}:cryptoKey`;
export const STORE_KEY = `${PREFIX}:store`;

// Functions
export function getSnapshot() {
	return idb.get(STORE_KEY);
}

export function setSnapshot(snapshot: StoreSnapshot) {
	return idb.set(STORE_KEY, snapshot);
}

export function clearSnapshot() {
	return idb.del(STORE_KEY);
}

export function getCryptoKey() {
	return idb.get(CRYPTO_KEY_KEY);
}

export function setCryptoKey(cryptoKey: CryptoKey) {
	return idb.set(CRYPTO_KEY_KEY, cryptoKey);
}

export function clearCryptoKey() {
	return idb.del(CRYPTO_KEY_KEY);
}
