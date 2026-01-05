import { store } from "@app/store";
import "./navbar.css";

export function Navbar() {
	return (
		<div className="navbar">
			<nav>
				<a href="/">Journal</a>
				<a href="/settings">Settings</a>
			</nav>
			<button
				type="button"
				onClick={promptCreateEntry}
				className="action-button"
			>
				+
			</button>
		</div>
	);
}

function promptCreateEntry() {
	const response = window.prompt("What's on your mind?");
	if (response && response.length > 0) {
		store.notes.add({
			content: response,
		});
	}
}
