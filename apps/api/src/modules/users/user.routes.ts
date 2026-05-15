import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { listUsers } from "./user.controller.js";
import { userSearchQuerySchema } from "./user.schema.js";

export const userRoutes = Router();

userRoutes.get("/", requireAuth, validate({ query: userSearchQuerySchema }), listUsers);
