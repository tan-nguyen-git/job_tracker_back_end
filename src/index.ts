import "dotenv/config";
import express from "express";
import applicationRoutes from "./routes/applicationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/applications", requireAuth, applicationRoutes);

//listening in port 3000
app.listen(3000, () => {
  console.log("JobTrack API listening on http://localhost:3000");
});
