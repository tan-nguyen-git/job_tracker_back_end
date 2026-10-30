import { Router, type Router as ExpressRouter } from "express";
import { randomUUID } from "node:crypto";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router: ExpressRouter = Router();

type PublicUser = { id: string; email: string };
type StoredUser = PublicUser & { password_hash: string };
//register page
router.post("/register", async (req, res) => {
  //email formater
  const { email, password } = req.body as { email?: unknown; password?: unknown };
  if (
    typeof email !== "string" ||
    !email.includes("@") ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return res
      .status(400)
      .json({ message: "Enter a valid email and a password of at least 8 characters" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const userId = randomUUID();
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").run(
    userId,
    normalizedEmail,
    passwordHash,
  );

  return res.status(201).json({ id: userId, email: normalizedEmail });
});
//post to login route
router.post("/login", async (req, res) => {
  //this is authentication
  const { email, password } = req.body as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(401).json({ message: "Email or password is incorrect" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db
    .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .get(normalizedEmail) as StoredUser | undefined;

  if (!user || !(await argon2.verify(user.password_hash, password))) {
    return res.status(401).json({ message: "Email or password is incorrect" });
  }
  //create a token
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Server configuration error" });
  }
  //this sub is set as user.id later use
  const accessToken = jwt.sign({ sub: user.id }, secret, { expiresIn: "15m" });
  return res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    })
    .status(200)
    .json({ user: { id: user.id, email: user.email } });
});

router.post("/logout", (_req, res) => {
  return res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })
    .sendStatus(204);
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT id, email FROM users WHERE id = ?").get(res.locals.userId) as
    | PublicUser
    | undefined;

  if (!user) {
    return res.status(401).json({ message: "Not signed in" });
  }

  return res.status(200).json(user);
});

export default router;
