import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type TokenPayload = {
  id: string;
  email: string;
};

export function signToken(payload: TokenPayload) {
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export const authCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  maxAge: 1000 * 60 * 60 * 24 * 7
};
