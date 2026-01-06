import {
	SignInButton as ClerkSignInButton,
	SignOutButton as ClerkSignOutButton,
	SignedIn,
	SignedOut,
	useUser,
} from "@clerk/clerk-react";
import { SignInIcon, SignOutIcon } from "@phosphor-icons/react";
import { clearCryptoKey } from "@app/store/crypto-key";

export function SettingsPage() {
	return (
		<div className="flex max-w-2xl flex-col gap-4 p-4">
			<article className="grid grid-cols-2 items-center rounded-md border p-4">
				<h2 className="col-span-2 font-medium">Account</h2>
				<SignedOut>
					<span className="text-sm text-white/70">
						Sign in to sync your data across devices
					</span>
					<div className="my-auto ms-auto">
						<SignInButton />
					</div>
				</SignedOut>
				<SignedIn>
					<div className="text-sm text-white/70">Sign out of your account</div>
					<div className="my-auto ms-auto">
						<SignOutButton />
					</div>
				</SignedIn>
			</article>
		</div>
	);
}

function SignInButton() {
	return (
		<ClerkSignInButton>
			<button
				type="button"
				className="flex size-full items-center justify-center gap-2 rounded-sm border bg-white/5 px-3 py-2"
			>
				Sign in
				<SignInIcon className="size-4" />
			</button>
		</ClerkSignInButton>
	);
}

function SignOutButton() {
	const { user } = useUser();

	const handleSignOut = async () => {
		// Clear crypto key from memory and IndexedDB before signing out
		if (user?.id) {
			await clearCryptoKey(user.id);
		}
	};

	return (
		<ClerkSignOutButton signOutCallback={handleSignOut}>
			<button
				type="button"
				className="flex items-center justify-center gap-2 rounded-sm border bg-white/5 px-2 py-1"
			>
				Sign out
				<SignOutIcon className="size-4" />
			</button>
		</ClerkSignOutButton>
	);
}
