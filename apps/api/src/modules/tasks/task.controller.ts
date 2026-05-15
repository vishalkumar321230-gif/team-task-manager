import { ProjectRole } from "@prisma/client";
import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as taskService from "./task.service.js";

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.listTasks(
    req.params.projectId,
    req.user!.id,
    req.projectRole!,
    req.query
  );
  res.json({ tasks });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.params.projectId, req.user!.id, req.body);
  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const role = await taskService.getTaskProjectRole(req.params.taskId, req.user!.id);
  const task = await taskService.updateTask(req.params.taskId, req.user!.id, role, req.body);
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const role = await taskService.getTaskProjectRole(req.params.taskId, req.user!.id);
  if (role !== ProjectRole.ADMIN) {
    return res.status(403).json({ message: "Admin access required" });
  }

  await taskService.deleteTask(req.params.taskId, req.user!.id);
  res.status(204).send();
});
