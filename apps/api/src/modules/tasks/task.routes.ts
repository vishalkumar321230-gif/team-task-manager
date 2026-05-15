import { ProjectRole } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { requireProjectMember } from "../../middlewares/project-role.js";
import { validate } from "../../middlewares/validate.js";
import * as controller from "./task.controller.js";
import {
  createTaskSchema,
  projectTasksParams,
  taskIdParams,
  taskQuerySchema,
  updateTaskStatusSchema,
  updateTaskSchema
} from "./task.schema.js";

export const taskRoutes = Router();

taskRoutes.use(requireAuth);

taskRoutes.get(
  "/projects/:projectId/tasks",
  validate({ params: projectTasksParams, query: taskQuerySchema }),
  requireProjectMember(),
  controller.listTasks
);

taskRoutes.post(
  "/projects/:projectId/tasks",
  validate({ params: projectTasksParams, body: createTaskSchema }),
  requireProjectMember(ProjectRole.ADMIN),
  controller.createTask
);

taskRoutes.patch(
  "/tasks/:taskId",
  validate({ params: taskIdParams, body: updateTaskSchema }),
  controller.updateTask
);

taskRoutes.post(
  "/tasks/:taskId/status",
  validate({ params: taskIdParams, body: updateTaskStatusSchema }),
  controller.updateTask
);

taskRoutes.delete(
  "/tasks/:taskId",
  validate({ params: taskIdParams }),
  controller.deleteTask
);

taskRoutes.post(
  "/tasks/:taskId/delete",
  validate({ params: taskIdParams }),
  controller.deleteTask
);
