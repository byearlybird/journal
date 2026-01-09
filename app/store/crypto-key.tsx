import { useAuth } from "@clerk/clerk-react";
import { deriveKey } from "@lib/crypto";
import { Store, useStore } from "@tanstack/react-store";
import * as idb from "idb-keyval";
import { useEffect, useMemo, useRef } from "react";

const cryptoKeyStore = new Store<CryptoKey | null>(null);

// Keys
const PREFIX = "journal";
const getCryptoKeyStorageKey = (userId: string) =>
	`${PREFIX}:crypto-key:${userId}`;

// Storage functions
async function loadPersistedCryptoKey(
	userId: string,
): Promise<CryptoKey | null> {
	return (await idb.get(getCryptoKeyStorageKey(userId))) ?? null;
}

async function persistCryptoKey(userId: string, key: CryptoKey): Promise<void> {
	return idb.set(getCryptoKeyStorageKey(userId), key);
}

async function clearPersistedCryptoKey(userId: string): Promise<void> {
	return idb.del(getCryptoKeyStorageKey(userId));
}

// Store functions
export function getCryptoKey() {
	return cryptoKeyStore.state;
}

export async function clearCryptoKey(userId: string) {
	cryptoKeyStore.setState(() => null);
	await clearPersistedCryptoKey(userId);
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
 * Sets the crypto key in the store and persists it to IndexedDB.
 */
export async function setCryptoKey(userId: string, key: CryptoKey) {
	cryptoKeyStore.setState(() => key);
	await persistCryptoKey(userId, key);
}

/**
 * Initializes the crypto key from IndexedDB when the user signs in.
 * Clears the crypto key from memory when the user signs out.
 */
export function useCryptoKeyInit() {
	const { isSignedIn, userId } = useAuth();
	const hasLoadedRef = useRef(false);

	useEffect(() => {
		if (!isSignedIn || !userId) {
			hasLoadedRef.current = false;
			// Clear crypto key from memory when user signs out
			cryptoKeyStore.setState(() => null);
			return;
		}

		// Load persisted key once when signed in
		if (!hasLoadedRef.current) {
			hasLoadedRef.current = true;
			loadPersistedCryptoKey(userId)
				.then((key) => {
					if (key) {
						cryptoKeyStore.setState(() => key);
					}
				})
				.catch((err) => {
					console.error("Failed to load persisted crypto key:", err);
				});
		}
	}, [isSignedIn, userId]);
}

export function useCryptoKey() {
	const { isLoaded, isSignedIn } = useAuth();
	const cryptoKey = useStore(cryptoKeyStore, (state) => state);

	const isRequired = useMemo(() => {
		return isSignedIn && cryptoKey === null;
	}, [isSignedIn, cryptoKey]);

	const isOkay = useMemo(() => {
		return !isRequired || (isSignedIn && cryptoKey !== null);
	}, [isSignedIn, cryptoKey, isRequired]);

	return {
		cryptoKey,
		isRequired,
		isLoaded,
		isOkay,
		setCryptoKey,
		clearCryptoKey,
	};
}

export function Guard({
	children,
	loading = null,
	required = null,
}: {
	children: React.ReactNode;
	loading?: React.ReactNode;
	required?: React.ReactNode;
}) {
	const { isRequired, isLoaded, cryptoKey } = useCryptoKey();

	if (!isLoaded) {
		return loading;
	}

	if (isRequired && cryptoKey === null) {
		return required;
	}

	return <>{children}</>;
}
