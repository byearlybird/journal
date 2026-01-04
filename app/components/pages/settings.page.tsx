import { clearCryptoKey } from "@app/store/crypto-key";
import { SignInButton, SignOutButton, useAuth } from "@clerk/clerk-react";
import "./settings.page.css";
import { SignInIcon, SignOutIcon } from "@phosphor-icons/react";

export function SettingsPage() {
	const { isSignedIn } = useAuth();

	const handleSignOut = () => {
		// Clear the encryption key on sign out
		clearCryptoKey();
	};

	return (
		<div className="settings-page">
			{isSignedIn ? (
				<SignOutButton>
					<button
						type="button"
						className="account-button"
						onClick={handleSignOut}
					>
						Sign Out <SignOutIcon size={16} />
					</button>
				</SignOutButton>
			) : (
				<SignInButton>
					<button type="button" className="account-button">
						Sign In <SignInIcon size={16} />
					</button>
				</SignInButton>
			)}
		</div>
	);
}
