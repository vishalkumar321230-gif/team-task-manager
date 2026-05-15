import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import * as projectService from "./project.service.js";

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await projectService.listProjects(req.user!.id);
  res.json({ projects });
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.createProject(req.user!.id, req.body);
  res.status(201).json({ project });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getProject(req.params.projectId, req.user!.id);
  res.json({ project });
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await projectService.addMember(req.params.projectId, req.user!.id, req.body);
  res.status(201).json({ member });
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  await projectService.removeMember(req.params.projectId, req.user!.id, req.params.userId);
  res.status(204).send();
});
