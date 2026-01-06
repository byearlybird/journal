import { deriveCryptoKey, Guard, setCryptoKey } from "@app/store/crypto-key";
import { validateCryptoKey } from "@app/store/sync";
import { useUser } from "@clerk/clerk-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
	CheckIcon,
	LockKeyIcon,
	SpinnerGapIcon,
	XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

export function CryptoKeyGuard({ children }: { children: React.ReactNode }) {
	return (
		<Guard loading={<Loading />} required={<Required />}>
			{children}
		</Guard>
	);
}

function Loading() {
	return (
		<div className="flex size-full flex-col items-center justify-center">
			<SpinnerGapIcon className="size-4 animate-spin" />
		</div>
	);
}

function Required() {
	const { user } = useUser();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [passphrase, setPassphrase] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleUnlock = () => {
		setIsDialogOpen(true);
		setError(null);
		setPassphrase("");
	};

	const handleSubmit = async () => {
		if (!user?.id || !passphrase.trim()) {
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Derive the key from passphrase
			const key = await deriveCryptoKey(passphrase, user.id);

			// Validate the key by trying to decrypt remote data
			const isValid = await validateCryptoKey(key);
			if (!isValid) {
				setError("Invalid passphrase. Please try again.");
				setIsLoading(false);
				return;
			}

			// Key is valid, set it in the store
			setCryptoKey(key);
			setIsDialogOpen(false);
			setPassphrase("");
		} catch (err) {
			console.error("Failed to derive key:", err);
			setError("Failed to set up encryption. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			setIsDialogOpen(false);
			setPassphrase("");
			setError(null);
		}
	};

	return (
		<>
			<div className="flex size-full flex-col items-center justify-center">
				<div className="flex flex-col justify-center gap-6 rounded-md border border-white/10 bg-black p-6">
					<div className="flex flex-col gap-2">
						<h2 className="font-medium text-lg">Unlock your journal</h2>
						<p className="text-sm text-white/70">
							Enter your passphrase to unlock your journal
						</p>
					</div>
					<div className="flex items-center justify-center gap-2">
						<button
							type="button"
							onClick={handleUnlock}
							className="flex items-center gap-2 rounded-sm border border-white/10 bg-white/5 p-2"
						>
							Unlock
							<LockKeyIcon className="size-4" />
						</button>
					</div>
				</div>
			</div>
			<AnimatePresence>
				{isDialogOpen && (
					<Dialog
						static
						open={isDialogOpen}
						onClose={handleClose}
						className="relative z-50"
					>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/50"
						/>
						<div className="fixed inset-x-0 top-0 flex h-svh w-screen justify-center p-2">
							<DialogPanel
								as={motion.div}
								initial={{ opacity: 0, y: -100 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -100 }}
								onAnimationComplete={() => {
									inputRef.current?.focus();
								}}
								className="flex h-auto w-full max-w-md flex-col space-y-4 rounded-lg border border-white/10 bg-graphite p-6"
							>
								<DialogTitle className="font-medium text-lg text-white">
									Enter your encryption passphrase
								</DialogTitle>
								<div className="flex flex-col gap-2">
									<input
										ref={inputRef}
										type="password"
										placeholder="Passphrase"
										value={passphrase}
										onChange={(e) => {
											setPassphrase(e.target.value);
											setError(null);
										}}
										onKeyDown={(e) => {
											if (
												e.key === "Enter" &&
												!isLoading &&
												passphrase.trim()
											) {
												handleSubmit();
											}
										}}
										disabled={isLoading}
										className="w-full rounded-md border border-white/10 bg-black/50 px-4 py-3 text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none disabled:opacity-50"
									/>
									{error && <p className="text-red-400 text-sm">{error}</p>}
								</div>
								<div className="flex justify-end gap-4">
									<button
										type="button"
										onClick={handleClose}
										disabled={isLoading}
										className="flex size-11 items-center justify-center rounded-full border border-white/10 disabled:opacity-50"
									>
										<XIcon className="h-4 w-4" />
									</button>
									<button
										type="button"
										disabled={isLoading || !passphrase.trim()}
										onClick={handleSubmit}
										className="flex size-11 items-center justify-center rounded-full bg-yellow text-black disabled:opacity-50"
									>
										{isLoading ? (
											<div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
										) : (
											<CheckIcon className="h-4 w-4" />
										)}
									</button>
								</div>
							</DialogPanel>
						</div>
					</Dialog>
				)}
			</AnimatePresence>
		</>
	);
}
