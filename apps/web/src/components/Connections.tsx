import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

const ConnectionsContext = createContext<{
	connections: string[];
	// todo: implement addConnection
	addConnection: (peerId: string) => void;
} | null>(null);

export function ConnectionsProvider({ children }: { children: ReactNode }) {
	const STORAGE_KEY = "connections";

	// Lazy-init from localStorage with basic validation and SSR safety
	const [connections, setConnections] = useState<string[]>(() => {
		if (typeof window === "undefined") return [];
		try {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) && parsed.every((v) => typeof v === "string")
				? (parsed as string[])
				: [];
		} catch {
			return [];
		}
	});

	const skipNextPersistRef = useRef(false);

	// Persist on change
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (skipNextPersistRef.current) {
			skipNextPersistRef.current = false;
			return;
		}
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
		} catch {
			// best-effort persistence; ignore quota or serialization errors
		}
	}, [connections]);

	// Keep state in sync if another tab updates localStorage
	useEffect(() => {
		if (typeof window === "undefined") return;
		const onStorage = (e: StorageEvent) => {
			if (e.key !== STORAGE_KEY) return;
			try {
				const next = e.newValue ? JSON.parse(e.newValue) : [];
				if (Array.isArray(next) && next.every((v) => typeof v === "string")) {
					skipNextPersistRef.current = true;
					setConnections(next as string[]);
				}
			} catch {
				// ignore invalid updates
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	const addConnection = useCallback((peerId: string) => {
		const id = peerId.trim();
		if (!id) return;
		setConnections((prev) => (prev.includes(id) ? prev : [...prev, id]));
	}, []);

	const contextValue = useMemo(
		() => ({ connections, addConnection }),
		[connections, addConnection],
	);

	return (
		<ConnectionsContext.Provider value={contextValue}>
			{children}
		</ConnectionsContext.Provider>
	);
}

export function useConnections() {
	const connections = useContext(ConnectionsContext);
	if (!connections) {
		throw new Error("useConnections must be used within a ConnectionsProvider");
	}
	return connections;
}
