import { useState } from "react";
import viteLogo from "/vite.svg";
import reactLogo from "./assets/react.svg";
import "./App.css";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
	useAuth,
} from "@clerk/clerk-react";

function App() {
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { getToken } = useAuth();

	const loadContent = async () => {
		setIsLoading(true);
		try {
			const token = await getToken();
			const res = await fetch("/api/", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = (await res.json()) as { content: string };
			setContent(data.content || "");
		} catch (error) {
			console.error("Failed to load:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const saveContent = async () => {
		setIsLoading(true);
		try {
			const token = await getToken();
			await fetch("/api/", {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: content,
			});
		} catch (error) {
			console.error("Failed to save:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<header>
				<SignedOut>
					<SignInButton>Sign In</SignInButton>
				</SignedOut>
				<SignedIn>
					<UserButton>User</UserButton>
				</SignedIn>
			</header>
			<div>
				<a href="https://vite.dev" target="_blank" rel="noopener">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank" rel="noopener">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Journal</h1>
			<div className="card">
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Write your journal entry..."
					rows={10}
					style={{ width: "100%", marginBottom: "1rem" }}
				/>
				<div style={{ display: "flex", gap: "0.5rem" }}>
					<button type="button" onClick={loadContent} disabled={isLoading}>
						Load
					</button>
					<button type="button" onClick={saveContent} disabled={isLoading}>
						Save
					</button>
				</div>
			</div>
		</>
	);
}

export default App;
