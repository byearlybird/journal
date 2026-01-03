import { store } from "@app/store";
import {
	clearCryptoKey,
	getCryptoKey,
	setCryptoKey as setCryptoKeyPersistence,
} from "@app/store/persistence";
import { useNotes } from "@app/store/queries";
import {
	SignInButton,
	SignOutButton,
	useAuth,
	useUser,
} from "@clerk/clerk-react";
import { deriveKey } from "@lib/crypto";
import { useEffect, useState } from "react";
import "./home-page.css";

export function HomePage() {
	const { isSignedIn } = useAuth();
	const { user } = useUser();
	const notes = useNotes();
	const [inputValue, setInputValue] = useState("");
	const [isLoadingKey, setIsLoadingKey] = useState(true);

	// Load or prompt for encryption key when signed in
	useEffect(() => {
		if (!isSignedIn || !user?.id) {
			setIsLoadingKey(false);
			return;
		}

		let cancelled = false;

		const initKey = async () => {
			// Try loading existing key from IDB
			const existingKey = await getCryptoKey();
			if (cancelled) return;

			if (existingKey) {
				setIsLoadingKey(false);
				return;
			}

			// No key found, prompt for passphrase
			const passphrase = prompt("Enter your encryption passphrase:");
			if (cancelled) return;

			if (!passphrase) {
				setIsLoadingKey(false);
				return;
			}

			try {
				const key = await deriveKey(passphrase, user.id);
				if (cancelled) return;

				await setCryptoKeyPersistence(key);
			} catch (err) {
				console.error("Failed to derive key:", err);
				alert("Failed to set up encryption. Please try again.");
			}

			setIsLoadingKey(false);
		};

		initKey();

		return () => {
			cancelled = true;
		};
	}, [isSignedIn, user?.id]);

	const handleAdd = () => {
		if (inputValue.trim()) {
			store.notes.add({ content: inputValue.trim() });
			setInputValue("");
		}
	};

	const handleSignOut = async () => {
		// Clear the encryption key on sign out
		await clearCryptoKey();
	};

	if (isLoadingKey && isSignedIn) {
		return <div className="home-page-loading">Loading encryption...</div>;
	}

	return (
		<div className="home-page">
			<div className="home-page-header">
				{isSignedIn ? (
					<SignOutButton>
						<button
							type="button"
							onClick={handleSignOut}
							className="home-page-button"
						>
							Sign Out
						</button>
					</SignOutButton>
				) : (
					<SignInButton>
						<button type="button" className="home-page-button">
							Sign In
						</button>
					</SignInButton>
				)}
			</div>

			<div className="home-page-form">
				<textarea
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					className="home-page-textarea"
					placeholder="This an un-saved entry"
				/>
				<button type="button" onClick={handleAdd} className="home-page-button">
					Add
				</button>
			</div>

			<div className="home-page-notes">
				{notes.map((note) => (
					<div key={note.id} className="home-page-note">
						{note.content}
					</div>
				))}
			</div>
		</div>
	);
}

