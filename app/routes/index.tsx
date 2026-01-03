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
		return (
			<div className="mx-auto max-w-3xl p-4 text-white">
				Loading encryption...
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl p-4">
			<div className="mb-4 flex items-center justify-end">
				{isSignedIn ? (
					<SignOutButton>
						<button
							type="button"
							onClick={handleSignOut}
							className="cursor-pointer border border-white bg-transparent px-4 py-2 text-white hover:bg-white/10"
						>
							Sign Out
						</button>
					</SignOutButton>
				) : (
					<SignInButton>
						<button
							type="button"
							className="cursor-pointer border border-white bg-transparent px-4 py-2 text-white hover:bg-white/10"
						>
							Sign In
						</button>
					</SignInButton>
				)}
			</div>

			<div className="mb-8 flex flex-col gap-2">
				<textarea
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					className="min-h-[100px] resize-y border border-white bg-transparent p-2 font-sans text-white placeholder:text-white/50"
					placeholder="This an un-saved entry"
				/>
				<button
					type="button"
					onClick={handleAdd}
					className="cursor-pointer border border-white bg-transparent px-4 py-2 text-white hover:bg-white/10"
				>
					Add
				</button>
			</div>

			<div className="flex flex-col gap-4">
				{notes.map((note) => (
					<div
						key={note.id}
						className="whitespace-pre-wrap break-words border border-white bg-transparent p-4 text-white"
					>
						{note.content}
					</div>
				))}
			</div>
		</div>
	);
}
