import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { authCookieOptions } from "../../utils/auth.js";
import * as authService from "./auth.service.js";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);
  res.cookie("accessToken", result.token, authCookieOptions);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.cookie("accessToken", result.token, authCookieOptions);
  res.json(result);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", authCookieOptions);
  res.json({ message: "Logged out successfully" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  res.json({ user });
});
