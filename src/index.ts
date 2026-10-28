import express from "express";
import type { Application } from "./types/applications.js";
import { db } from "./db.js";
const app = express();
app.use(express.json());

function isApplication(value: unknown): value is Application {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.companyName === "string" &&
    typeof candidate.jobTitle === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.dateApplied === "string" &&
    ["Applied", "Interview", "Rejected", "Offer"].includes(candidate.status as string) &&
    typeof candidate.jobUrl === "string"
  );
}

app.get("/api/applications", (_req, res) => {
  const query = db.prepare("SELECT * FROM applications");
  const applications = query.all();
  res.json(applications);
});

app.post("/api/applications", (req, res) => {
  if (!isApplication(req.body)) {
    return res.status(400).json({ message: "Invalid application data" });
  }
  const getApps = db.prepare("SELECT * FROM applications");
  const applications = getApps.all();

  if (applications.some((application) => application.id === req.body.id)) {
    return res.status(409).json({ message: "Application ID already exists" });
  }
  const { id, companyName, jobTitle, category, dateApplied, status, jobUrl } = req.body;
  const query = db.prepare(`
    INSERT INTO applications 
    (id, companyName, jobTitle, category, dateApplied,status, jobUrl)
    values(?, ?, ?, ?, ?, ?,?)`);
  query.run(id, companyName, jobTitle, category, dateApplied, status, jobUrl);
  return res.status(201).json(req.body);
});

app.put("/api/applications/:id", (req, res) => {
  if (!isApplication(req.body)) {
    return res.status(400).json({ message: "Invalid application data" });
  }
  const editedApp = req.body;
  const insert = db.prepare(`
        UPDATE applications
        SET companyName = ?,
        jobTitle =?,
        category =?,
        dateApplied=?,
        status=?,
        jobUrl=?
        WHERE id= ?
    `);
  const result = insert.run(
    editedApp.companyName,
    editedApp.jobTitle,
    editedApp.category,
    editedApp.dateApplied,
    editedApp.status,
    editedApp.jobUrl,
    req.params.id,
  );

  if (result.changes === 0) {
    return res.status(404).json({ message: "Application not found" });
  }

  // The URL identifies the record, so it remains the ID even if the body differs.

  return res.status(200).json();
});

app.delete("/api/applications/:id", (req, res) => {
  const insert = db.prepare(`
        DELETE FROM applications
        WHERE id= ?
    `);
  const result = insert.run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ message: "Application not found" });
  }

  return res.sendStatus(204);
});

//listening in port 3000
app.listen(3000, () => {
  console.log("JobTrack API listening on http://localhost:3000");
});
