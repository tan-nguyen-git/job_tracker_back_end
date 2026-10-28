import Database from "better-sqlite3";

export const db: Database.Database = new Database("jobtrack.sqlite");

db.exec(`
  IF NOT EXISTS CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

IF NOT EXISTS CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  companyName TEXT NOT NULL,
  jobTitle TEXT NOT NULL,
  category TEXT NOT NULL,
  dateApplied TEXT NOT NULL,
  status TEXT NOT NULL,
  jobUrl TEXT NOT NULL
);`);
