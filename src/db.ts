import Database from "better-sqlite3";

export const db: Database.Database = new Database("jobtrack.sqlite");

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users  (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS applications(
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  companyName TEXT NOT NULL,
  jobTitle TEXT NOT NULL,
  category TEXT NOT NULL,
  dateApplied TEXT NOT NULL,
  status TEXT NOT NULL,
  jobUrl TEXT NOT NULL
);`);

// Add the ownership column when opening a database created before user accounts.
// Existing applications remain unassigned until you decide which user owns them.
const applicationColumns = db.pragma("table_info(applications)") as { name: string }[];
if (!applicationColumns.some((column) => column.name === "user_id")) {
  db.exec("ALTER TABLE applications ADD COLUMN user_id TEXT REFERENCES users(id)");
}
