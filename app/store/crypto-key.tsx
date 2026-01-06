import { useAuth } from "@clerk/clerk-react";
import { deriveKey } from "@lib/crypto";
import { useStore } from "@nanostores/react";
import { atom } from "nanostores";
import { useMemo } from "react";

const $cryptoKey = atom<CryptoKey | null>(null);

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

export function useCryptoKey() {
	const { isLoaded, isSignedIn } = useAuth();
	const cryptoKey = useStore($cryptoKey);

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
