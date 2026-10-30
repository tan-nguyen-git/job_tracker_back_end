import { Router, type Router as ExpressRouter } from "express";
import type { Application } from "../types/applications.js";
import { db } from "../db.js";

const router: ExpressRouter = Router();

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

router.get("/", (_req, res) => {
  //extract user id from res.locals.userId
  const userId = res.locals.userId as string;
  const applications = db
    .prepare(
      "SELECT id, companyName, jobTitle, category, dateApplied, status, jobUrl FROM applications WHERE user_id = ?",
    )
    .all(userId);

  return res.json(applications);
});

router.post("/", (req, res) => {
  if (!isApplication(req.body)) {
    return res.status(400).json({ message: "Invalid application data" });
  }

  const userId = res.locals.userId as string;
  const { id, companyName, jobTitle, category, dateApplied, status, jobUrl } = req.body;
  const existingApplication = db.prepare("SELECT id FROM applications WHERE id = ?").get(id);

  if (existingApplication) {
    return res.status(409).json({ message: "Application ID already exists" });
  }

  db.prepare(`
    INSERT INTO applications
      (id, user_id, companyName, jobTitle, category, dateApplied, status, jobUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, companyName, jobTitle, category, dateApplied, status, jobUrl);

  return res.status(201).json({ ...req.body, user_id: userId });
});

router.put("/:id", (req, res) => {
  if (!isApplication(req.body)) {
    return res.status(400).json({ message: "Invalid application data" });
  }

  const userId = res.locals.userId as string;
  const editedApplication: Application = { ...req.body, id: req.params.id };
  const result = db
    .prepare(`
    UPDATE applications
    SET companyName = ?,
        jobTitle = ?,
        category = ?,
        dateApplied = ?,
        status = ?,
        jobUrl = ?
    WHERE id = ? AND user_id = ?
  `)
    .run(
      editedApplication.companyName,
      editedApplication.jobTitle,
      editedApplication.category,
      editedApplication.dateApplied,
      editedApplication.status,
      editedApplication.jobUrl,
      req.params.id,
      userId,
    );

  if (result.changes === 0) {
    return res.status(404).json({ message: "Application not found" });
  }

  return res.status(200).json(editedApplication);
});

router.delete("/:id", (req, res) => {
  const userId = res.locals.userId as string;
  const result = db
    .prepare("DELETE FROM applications WHERE id = ? AND user_id = ?")
    .run(req.params.id, userId);

  if (result.changes === 0) {
    return res.status(404).json({ message: "Application not found" });
  }

  return res.sendStatus(204);
});

export default router;
