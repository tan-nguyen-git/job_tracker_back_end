import { DatabaseSync } from "node:sqlite";

export const db = new DatabaseSync("jobtrack.sqlite");

db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    companyName TEXT NOT NULL,
    jobTitle TEXT NOT NULL,
    category TEXT NOT NULL,
    dateApplied TEXT NOT NULL,
    status TEXT NOT NULL,
    jobUrl TEXT NOT NULL
  );
`);
