import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { requireProjectMember } from "../../middlewares/project-role.js";
import { validate } from "../../middlewares/validate.js";
import { getDashboard } from "./dashboard.controller.js";
import { projectIdParams } from "../projects/project.schema.js";

export const dashboardRoutes = Router();

dashboardRoutes.get(
  "/:projectId/dashboard",
  requireAuth,
  validate({ params: projectIdParams }),
  requireProjectMember(),
  getDashboard
);
