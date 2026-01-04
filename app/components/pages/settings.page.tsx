import { clearCryptoKey } from "@app/store/crypto-key";
import { SignInButton, SignOutButton, useAuth } from "@clerk/clerk-react";
import { SignInIcon, SignOutIcon } from "@phosphor-icons/react";

export function SettingsPage() {
	const { isSignedIn } = useAuth();

	const handleSignOut = () => {
		// Clear the encryption key on sign out
		clearCryptoKey();
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			{isSignedIn ? (
				<SignOutButton>
					<button
						type="button"
						className="flex items-center gap-2 border border-white bg-white p-4 text-black"
						onClick={handleSignOut}
					>
						Sign Out <SignOutIcon className="size-4" />
					</button>
				</SignOutButton>
			) : (
				<SignInButton>
					<button
						type="button"
						className="flex items-center gap-2 border border-white bg-white p-4 text-black"
					>
						Sign In <SignInIcon className="size-4" />
					</button>
				</SignInButton>
			)}
		</div>
	);
}
