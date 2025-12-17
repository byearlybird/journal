const DB_NAME = "journal_auth";
const DB_VERSION = 1;
const STORE_NAME = "crypto_keys";
const KEY_NAME = "master_key";

/**
 * Opens the IndexedDB database for crypto key storage
 */
function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
	});
}

/**
 * Stores a CryptoKey in IndexedDB
 */
export async function storeCryptoKey(key: CryptoKey): Promise<void> {
	const db = await openDb();
	const transaction = db.transaction(STORE_NAME, "readwrite");
	const store = transaction.objectStore(STORE_NAME);

	// CryptoKey cannot be stored directly, so we need to export it first
	const exported = await crypto.subtle.exportKey("raw", key);
	const keyData = Array.from(new Uint8Array(exported));

	return new Promise((resolve, reject) => {
		const request = store.put(keyData, KEY_NAME);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}

/**
 * Retrieves a CryptoKey from IndexedDB
 */
export async function getCryptoKey(): Promise<CryptoKey | null> {
	const db = await openDb();
	const transaction = db.transaction(STORE_NAME, "readonly");
	const store = transaction.objectStore(STORE_NAME);

	return new Promise((resolve, reject) => {
		const request = store.get(KEY_NAME);
		request.onerror = () => reject(request.error);
		request.onsuccess = async () => {
			const keyData = request.result;
			if (!keyData) {
				resolve(null);
				return;
			}

			try {
				// Import the key back from the stored data
				const keyBuffer = new Uint8Array(keyData).buffer;
				const key = await crypto.subtle.importKey(
					"raw",
					keyBuffer,
					{ name: "AES-GCM" },
					false,
					["encrypt", "decrypt"],
				);
				resolve(key);
			} catch (error) {
				reject(error);
			}
		};
	});
}

/**
 * Deletes the CryptoKey from IndexedDB
 */
export async function deleteCryptoKey(): Promise<void> {
	const db = await openDb();
	const transaction = db.transaction(STORE_NAME, "readwrite");
	const store = transaction.objectStore(STORE_NAME);

	return new Promise((resolve, reject) => {
		const request = store.delete(KEY_NAME);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}

/**
 * Stubs the decryption of encryptedMasterKey
 * TODO: Replace with actual decryption implementation
 */
export async function decryptMasterKey(
	encryptedMasterKey: string,
	password: string,
): Promise<CryptoKey> {
	// Stub: Return a mock CryptoKey for now
	// In the real implementation, this would decrypt encryptedMasterKey using the password
	const keyData = new Uint8Array(32).fill(0); // Mock 256-bit key
	return crypto.subtle.importKey(
		"raw",
		keyData.buffer,
		{ name: "AES-GCM" },
		false,
		["encrypt", "decrypt"],
	);
}
