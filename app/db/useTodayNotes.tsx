import { useQuery } from "@tanstack/react-query";
import { sql } from "kysely";
import { useDb } from "./db-provider";

export function useTodayNotes() {
	const { db } = useDb();

	return useQuery({
		queryKey: ["notes", "list", "today"],
		queryFn: () =>
			db
				.selectFrom("note")
				.where(sql`DATE(created_at)`, "=", sql`DATE('now')`)
				.orderBy("created_at", "desc")
				.selectAll()
				.execute(),
	});
}
