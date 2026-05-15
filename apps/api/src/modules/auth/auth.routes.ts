import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as controller from "./auth.controller.js";
import { loginSchema, signupSchema } from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/signup", validate({ body: signupSchema }), controller.signup);
authRoutes.post("/login", validate({ body: loginSchema }), controller.login);
authRoutes.post("/logout", controller.logout);
authRoutes.get("/me", requireAuth, controller.me);
