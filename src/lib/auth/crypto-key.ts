/**
 * Stores a CryptoKey in IndexedDB
 * TODO: Wire up actual crypto operations
 */
export async function storeCryptoKey(_key: CryptoKey): Promise<void> {
	// No-op for now
	return Promise.resolve();
}

/**
 * Retrieves a CryptoKey from IndexedDB
 * TODO: Wire up actual crypto operations
 */
export async function getCryptoKey(): Promise<CryptoKey | null> {
	// Return a mock key for now to keep auth flow working
	const keyData = new Uint8Array(32).fill(0); // Mock 256-bit key
	return crypto.subtle.importKey(
		"raw",
		keyData.buffer,
		{ name: "AES-GCM" },
		true,
		["encrypt", "decrypt"],
	);
}

/**
 * Deletes the CryptoKey from IndexedDB
 * TODO: Wire up actual crypto operations
 */
export async function deleteCryptoKey(): Promise<void> {
	// No-op for now
	return Promise.resolve();
}

/**
 * Decrypts the encrypted master key
 * TODO: Wire up actual crypto operations
 */
export async function decryptMasterKey(
	_encryptedMasterKey: string,
	_password: string,
): Promise<CryptoKey> {
	// No-op: Return a mock CryptoKey without doing any actual decryption
	const keyData = new Uint8Array(32).fill(0); // Mock 256-bit key
	return crypto.subtle.importKey(
		"raw",
		keyData.buffer,
		{ name: "AES-GCM" },
		true, // extractable: true so it can be exported for storage
		["encrypt", "decrypt"],
	);
}
