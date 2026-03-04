import { SQLocal } from "sqlocal";

const { sql, transaction } = new SQLocal("journal.sqlite3");
export { sql, transaction };
