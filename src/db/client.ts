import { connect } from "@tursodatabase/database-wasm/vite";

const db = await connect("journal.sqlite3");

export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Record<string, unknown>[]> {
  // Build query: join template parts with "?" placeholders
  const query = strings.join("?");
  return db.prepare(query).all(...values);
}

export async function transaction(
  fn: (tx: { sql: typeof sql }) => Promise<void>,
): Promise<void> {
  const wrapped = db.transaction(async () => {
    await fn({ sql });
  });
  await wrapped();
}
