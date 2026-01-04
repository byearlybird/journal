import {
	deriveCryptoKey,
	setCryptoKey,
	useCryptoKey,
} from "@app/store/crypto-key";
import { validateCryptoKey } from "@app/store/sync";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useState } from "react";
import "./crypto-key-guard.css";

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
			<div className="crypto-key-guard">
				<div className="crypto-key-guard-content">Loading...</div>
			</div>
		);
	}

	// Needs key state (signed in but no key)
	if (isSignedIn && !cryptoKey) {
		return (
			<div className="crypto-key-guard">
				<div className="crypto-key-guard-content">
					<p>Enter your key to unlock</p>
					<button
						type="button"
						className="crypto-key-guard-button"
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
