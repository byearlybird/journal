import { type ReactNode, useEffect, useState } from "react";
import { db } from "@/lib/db";

type DbProviderProps = {
	children: ReactNode;
};

export const DbProvider = ({ children }: DbProviderProps) => {
	const [dbReady, setDbReady] = useState(false);

	useEffect(() => {
		db.init().then(() => setDbReady(true));
	}, []);

	return dbReady ? children : null;
};
