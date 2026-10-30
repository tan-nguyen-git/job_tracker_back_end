import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

//get the access token from the header
function getAccessToken(cookieHeader: string | undefined): string | undefined {
  const tokenCookie = cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("accessToken="));

  return tokenCookie?.slice("accessToken=".length);
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = getAccessToken(req.headers.cookie);
  if (!token) {
    return res.status(401).json({ message: "Not signed in" });
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    //verify the token
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      return res.status(401).json({ message: "Not signed in" });
    }

    res.locals.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: "Not signed in" });
  }
};
