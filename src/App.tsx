import { useState } from "react";
import styles from "./App.module.css";

interface Note {
	id: number;
	content: string;
}

function App() {
	const [notes, setNotes] = useState<Note[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [nextId, setNextId] = useState(1);

	const handleAdd = () => {
		if (inputValue.trim()) {
			setNotes([...notes, { id: nextId, content: inputValue.trim() }]);
			setNextId(nextId + 1);
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
		<div className={styles.container}>
			<div className={styles.actions}>
				<button type="button" onClick={handlePull} className={styles.button}>
					Pull
				</button>
				<button type="button" onClick={handlePush} className={styles.button}>
					Push
				</button>
			</div>

			<div className={styles.inputSection}>
				<textarea
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					className={styles.textarea}
					placeholder="This an un-saved entry"
				/>
				<button type="button" onClick={handleAdd} className={styles.button}>
					Add
				</button>
			</div>

			<div className={styles.notesList}>
				{notes.map((note) => (
					<div key={note.id} className={styles.note}>
						{note.content}
					</div>
				))}
			</div>
		</div>
	);
}

export default App;
