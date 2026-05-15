import type { NextFunction, Request, Response } from "express";
import { ProjectRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/api-error.js";

export function requireProjectMember(requiredRole?: ProjectRole) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId || req.body.projectId;
      const userId = req.user?.id;

      if (!projectId || !userId) {
        throw new ApiError(400, "Project context is required");
      }

      const membership = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId, projectId } }
      });

      if (!membership) {
        throw new ApiError(403, "You do not belong to this project");
      }

      if (requiredRole === ProjectRole.ADMIN && membership.role !== ProjectRole.ADMIN) {
        throw new ApiError(403, "Admin access required");
      }

      req.projectRole = membership.role;
      next();
    } catch (error) {
      next(error);
    }
  };
}
