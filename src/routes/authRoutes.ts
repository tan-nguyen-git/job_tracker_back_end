import { Router, type Router as ExpressRouter } from "express";
import type { Application } from "../types/applications.js";
import { db } from "../db.js";
import * as argon2 from "argon2";
import { randomUUID } from "node:crypto";

const router: ExpressRouter = Router();
//user regist
//for now just 1 factor authentication
//record email, password_hash and and id
//argon2.hash(password, { type: argon2.argon2id });
router.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassWord = argon2.hash(password, { type: argon2.argon2id });
  const userId = randomUUID();
  const query = db.prepare(`
        INSERT INTO users
        (id,email, password_hash) values
        (?,?,?)
        `);

  const result = query.run(userId, email, hashedPassWord);
  //not insert successfully
  if (result.changes !== 1) {
    return res.status(409).json({ message: "Can't regist this user" });
  }

  return res.status(201).json(req.body);
});
////argon2.verify(storedHash, password);

router.post("/login", (req, res) => {});
//
router.post("/logout", (req, res) => {});
//
router.post("/me", (req, res) => {});

export default router;
