import { SignInButton, SignOutButton, useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { useNotes, useStoreContext } from "./store";

function App() {
	const { isSignedIn } = useAuth();
	const store = useStoreContext();
	const notes = useNotes();
	const [inputValue, setInputValue] = useState("");

	const handleAdd = () => {
		if (inputValue.trim()) {
			store.notes.add({ content: inputValue.trim() });
			setInputValue("");
		}
	};

	const handleSync = async () => {
		// Pull first
		try {
			const res = await fetch("/api/journal", {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();
			if (data.content) {
				const parsedData = JSON.parse(data.content);
				store.merge(parsedData);
			}
		} catch (err) {
			console.error(err);
		}

		// Then push
		const snapshot = store.$snapshot.get();
		await fetch("/api/journal", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(snapshot),
		});
	};

	return (
		<div className="mx-auto max-w-3xl p-4">
			<div className="mb-4 flex items-center justify-between">
				<button
					type="button"
					onClick={handleSync}
					disabled={!isSignedIn}
					className="cursor-pointer border border-white bg-transparent px-4 py-2 text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Sync
				</button>
				{isSignedIn ? (
					<SignOutButton>
						<button
							type="button"
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

export default App;
