import * as idb from "idb-keyval";

const IDB_KEY = "journal:cryptoKey";

export async function getCryptoKey(): Promise<CryptoKey | null> {
	const key = await idb.get<CryptoKey>(IDB_KEY);
	return key ?? null;
}

export async function saveCryptoKey(key: CryptoKey): Promise<void> {
	await idb.set(IDB_KEY, key);
}

export async function clearCryptoKey(): Promise<void> {
	await idb.del(IDB_KEY);
}
