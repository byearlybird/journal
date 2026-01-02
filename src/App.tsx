import { useState } from "react";
import { useNotes, useStoreContext } from "./store";

function App() {
	const store = useStoreContext();
	const notes = useNotes();
	const [inputValue, setInputValue] = useState("");

	const handleAdd = () => {
		if (inputValue.trim()) {
			store.notes.add({ content: inputValue.trim() });
			setInputValue("");
		}
	};

	const handlePush = () => {
		// No-op: will later sync notes to cloud
	};

	const handlePull = () => {
		// No-op: will later sync notes from cloud
	};

	return (
		<div className="mx-auto max-w-3xl p-4">
			<div className="mb-4 flex gap-4">
				<button
					type="button"
					onClick={handlePull}
					className="cursor-pointer border border-white bg-transparent px-4 py-2 text-white hover:bg-white/10"
				>
					Pull
				</button>
				<button
					type="button"
					onClick={handlePush}
					className="cursor-pointer border border-white bg-transparent px-4 py-2 text-white hover:bg-white/10"
				>
					Push
				</button>
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
