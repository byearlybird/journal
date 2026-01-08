import { migrator } from "@app/db/migrator";
import { useEffect, useState } from "react";

interface DbMigratorProps {
	loading: React.ReactNode;
	children: React.ReactNode;
}

export function DbMigrator({ loading, children }: DbMigratorProps) {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const runMigrations = async () => {
			try {
				await migrator.migrateToLatest();
				setIsLoading(false);
			} catch (err) {
				const migrationError =
					err instanceof Error ? err : new Error(String(err));

				throw migrationError;
			}
		};

		runMigrations();
	}, []);

	return isLoading ? <>{loading}</> : <>{children}</>;
}
