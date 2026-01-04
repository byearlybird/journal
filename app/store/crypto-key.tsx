import { useStore } from "@nanostores/react";
import { atom } from "nanostores";
import { deriveKey } from "@lib/crypto";

const $cryptoKey = atom<CryptoKey | null>(null);

export function useCryptoKey() {
	return useStore($cryptoKey);
}

export function getCryptoKey() {
	return $cryptoKey.get();
}

export function clearCryptoKey() {
	$cryptoKey.set(null);
}

/**
 * Derives a crypto key from a passphrase without setting it in the store.
 * Use this to validate the key before committing it.
 */
export async function deriveCryptoKey(
	passphrase: string,
	userId: string,
): Promise<CryptoKey> {
	return deriveKey(passphrase, userId);
}

/**
 * Sets the crypto key in the store.
 */
export function setCryptoKey(key: CryptoKey) {
	$cryptoKey.set(key);
}
