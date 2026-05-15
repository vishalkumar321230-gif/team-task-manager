import { ProjectRole } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { requireProjectMember } from "../../middlewares/project-role.js";
import { validate } from "../../middlewares/validate.js";
import * as controller from "./project.controller.js";
import {
  addMemberSchema,
  createProjectSchema,
  memberParamsSchema,
  projectIdParams
} from "./project.schema.js";

export const projectRoutes = Router();

projectRoutes.use(requireAuth);

projectRoutes.get("/", controller.listProjects);
projectRoutes.post("/", validate({ body: createProjectSchema }), controller.createProject);
projectRoutes.get(
  "/:projectId",
  validate({ params: projectIdParams }),
  requireProjectMember(),
  controller.getProject
);
projectRoutes.post(
  "/:projectId/members",
  validate({ params: projectIdParams, body: addMemberSchema }),
  requireProjectMember(ProjectRole.ADMIN),
  controller.addMember
);
projectRoutes.delete(
  "/:projectId/members/:userId",
  validate({ params: memberParamsSchema }),
  requireProjectMember(ProjectRole.ADMIN),
  controller.removeMember
);
