import "./navbar.css";

export function Navbar() {
	return (
		<div className="navbar">
			<nav>
				<a href="/journal">Journal</a>
				<a href="/settings">Settings</a>
			</nav>
			<button type="button" className="action-button">
				+
			</button>
		</div>
	);
}
