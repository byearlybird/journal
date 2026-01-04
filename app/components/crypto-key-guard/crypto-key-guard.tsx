import {
	deriveCryptoKey,
	setCryptoKey,
	useCryptoKey,
} from "@app/store/crypto-key";
import { validateCryptoKey } from "@app/store/sync";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useState } from "react";

export function CryptoKeyGuard({ children }: { children: React.ReactNode }) {
	const { isSignedIn } = useAuth();
	const cryptoKey = useCryptoKey();
	const { user } = useUser();
	const [isLoading, setIsLoading] = useState(false);

	const handleUnlock = async () => {
		if (!user?.id) return;

		const passphrase = prompt("Enter your encryption passphrase:");
		if (!passphrase) {
			return;
		}

		setIsLoading(true);

		try {
			// Derive the key from passphrase
			const key = await deriveCryptoKey(passphrase, user.id);

			// Validate the key by trying to decrypt remote data
			const isValid = await validateCryptoKey(key);
			if (!isValid) {
				alert("Invalid passphrase. Please try again.");
				return;
			}

			// Key is valid, set it in the store
			setCryptoKey(key);
		} catch (err) {
			console.error("Failed to derive key:", err);
			alert("Failed to set up encryption. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="flex flex-col items-center gap-4 border border-white bg-black p-6">
					Loading...
				</div>
			</div>
		);
	}

	// Needs key state (signed in but no key)
	if (isSignedIn && !cryptoKey) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="flex flex-col items-center gap-4 border border-white bg-black p-6">
					<p className="m-0 text-white">Enter your key to unlock</p>
					<button
						type="button"
						className="cursor-pointer border-none bg-white px-6 py-3 font-sans text-base text-black"
						onClick={handleUnlock}
					>
						Unlock
					</button>
				</div>
			</div>
		);
	}

	// Ready state (not signed in OR key provided)
	return <>{children}</>;
}
