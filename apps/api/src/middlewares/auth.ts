import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import { verifyToken } from "../utils/auth.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const bearer = req.header("authorization")?.replace("Bearer ", "");
  const token = bearer || req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}
