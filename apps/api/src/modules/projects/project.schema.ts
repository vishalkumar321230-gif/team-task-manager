import { ProjectRole } from "@prisma/client";
import { z } from "zod";

export const projectIdParams = z.object({
  projectId: z.string().min(1)
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional().nullable()
});

export const addMemberSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  role: z.nativeEnum(ProjectRole).default(ProjectRole.MEMBER)
});

export const memberParamsSchema = z.object({
  projectId: z.string().min(1),
  userId: z.string().min(1)
});
