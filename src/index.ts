import express from "express";
import type { Application } from "./types/applications.js";
import { db } from "./db.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(express.json());

app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);
app.use(express.json());

//listening in port 3000
app.listen(3000, () => {
  console.log("JobTrack API listening on http://localhost:3000");
});
